import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Libertin } from '../interfaces/libertin'
import { User } from '../interfaces/user'
import { fetchUsers } from '../../services/fetchAllUser'
import { fetchAnnounceDetails } from '../../services/announcesLibertins'
import calculateAge from '../fonctions/calculateAge'
import { calculateDistance } from '../fonctions/calculateDistance'
import citiesData from '../../public/data/cities.json'
import { SearchFilters } from './SearchFiltersContext'
import LibertinCard from './LibertinCard'
import EstablishmentsFilters from './EstablishmentsFilters'

const ITEMS_PER_PAGE = 12

const distanceRanges: { [key: string]: number[] } = {
  '< 10km': [0, 10],
  '< 20km': [0, 20],
  '< 50km': [0, 50],
  '< 75km': [0, 75],
  '< 100km': [0, 100],
}

interface LibertinWithUser extends Libertin {
  user: User
  age: number | null
  galleryUrl?: string
}

type SortType =
  | ''
  | 'maison privee'
  | 'bars et clubs prive'
  | 'hotels coquins'
  | 'saunas prives'
  | 'salons de massage'
  | 'clubs echangistes'

interface ProvinceOption {
  value: string
  label: string
}

interface AnnouncesLibertinProps {
  initialStatusFilter: string | null
}

const getCityCoordinates = (cityName: string) => {
  for (const province of citiesData) {
    const city = province.cities.find(c => c.city_fr === cityName)
    if (city) {
      return { latitude: city.latitude, longitude: city.longitude }
    }
  }
  return { latitude: 0, longitude: 0 }
}

const LibertinsHome: React.FC<AnnouncesLibertinProps> = ({
  initialStatusFilter,
}) => {
  const [libertins, setLibertins] = useState<Libertin[]>([])
  const [filteredLibertins, setFilteredLibertins] = useState<Libertin[]>([])
  const [displayedLibertins, setDisplayedLibertins] = useState<Libertin[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedStatuses] = useState<string[]>([])
  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [sortType, setSortType] = useState<SortType>(
    (initialStatusFilter as SortType) || '',
  )
  const [provinceOptions] = useState<ProvinceOption[]>([])
  const [libertinsWithUsers] = useState<LibertinWithUser[]>([])
  const [filters, setFilters] = useState<SearchFilters>({
    imLookingFor: [],
    orientation: [],
    iLiveIn: [],
    distance: [],
    rememberFilters: false,
  })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const observer = useRef<IntersectionObserver>()
  const lastLibertinElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prevPage => prevPage + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore],
  )

  const findProvince = (city: string): string | undefined => {
    for (const province of citiesData) {
      if (
        province.cities.some(
          c => c.city_fr.toLowerCase() === city.toLowerCase(),
        )
      ) {
        return province.province
      }
    }
    return undefined
  }

  useEffect(() => {
    const savedFilters = localStorage.getItem('searchFilters')
    if (savedFilters) {
      const parsedFilters = JSON.parse(savedFilters)
      setFilters(parsedFilters)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await fetchUsers()
        setUsers(usersData)

        const response = await fetch('http://localhost:3333/api/libertins')
        if (!response.ok) {
          throw new Error('Failed to fetch libertins')
        }
        const data = await response.json()
        const libertinIds = data.map((libertin: { id: string }) => libertin.id)

        const libertinDetails = await Promise.all(
          libertinIds.map(async (id: string) => {
            const libertinData = await fetchAnnounceDetails(id)
            const user = usersData.find(
              user => user.id === libertinData.libertin.userId,
            )
            const defaultImageUrl = (gender: string | undefined) => {
              const baseUrl = window.location.origin

              switch (gender) {
                case 'man':
                  return `${baseUrl}/images/silouhette-male.jpg`
                case 'woman':
                  return `${baseUrl}/images/silouhette-female.jpg`
                case 'transgender':
                  return `${baseUrl}/images/silouhette-transgender.jpg`
                case 'couple':
                  return `${baseUrl}/images/silouhette-couple.jpg`
                default:
                  return `${baseUrl}/images/silouhette.jpg`
              }
            }

            return {
              ...libertinData.libertin,
              age: user ? calculateAge(user.birthday) : null,
              user: user || {
                id: 0,
                birthday: '',
                nickname: '',
                userProfile: { gender: '', orientation: '' },
                address: { city: '' },
              },
              galleryUrl:
                libertinData.gallery.find((img: any) => img.cover)?.fileUrl ||
                defaultImageUrl(user?.userProfile.gender),
            }
          }),
        )

        const sortedLibertins = libertinDetails.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )

        setLibertins(sortedLibertins)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const filtered = libertins.filter(libertin => {
      const user = users.find(u => u.id === libertin.user.id)
      if (!user) return false

      const matchesJeCherche =
        filters.imLookingFor.length === 0 ||
        filters.imLookingFor.includes(user.userProfile.gender)

      const matchesOrientation =
        filters.orientation.length === 0 ||
        filters.orientation.includes(user.userProfile.orientation)

      let matchesLocation = filters.iLiveIn.length === 0

      if (!matchesLocation && filters.iLiveIn.length > 0) {
        const filterCity = getCityCoordinates(filters.iLiveIn[0])
        const userCity = getCityCoordinates(user.address.city)

        if (filterCity && userCity) {
          const distance = calculateDistance(
            filterCity.latitude,
            filterCity.longitude,
            userCity.latitude,
            userCity.longitude,
          )

          if (filters.distance.length > 0) {
            const [, maxDistance] = distanceRanges[filters.distance[0]] || [
              0,
              Infinity,
            ]
            matchesLocation = distance <= maxDistance
          } else {
            matchesLocation =
              filterCity.latitude === userCity.latitude &&
              filterCity.longitude === userCity.longitude
          }
        }
      }

      return matchesJeCherche && matchesOrientation && matchesLocation
    })

    if (filters.iLiveIn.length > 0) {
      const referenceCity = getCityCoordinates(filters.iLiveIn[0])
      if (referenceCity) {
        filtered.sort((a, b) => {
          const cityA = getCityCoordinates(a.user.address.city)
          const cityB = getCityCoordinates(b.user.address.city)
          if (cityA && cityB) {
            const distanceA = calculateDistance(
              referenceCity.latitude,
              referenceCity.longitude,
              cityA.latitude,
              cityA.longitude,
            )
            const distanceB = calculateDistance(
              referenceCity.latitude,
              referenceCity.longitude,
              cityB.latitude,
              cityB.longitude,
            )
            return distanceA - distanceB
          }
          return 0
        })
      }
    }

    setFilteredLibertins(filtered)
    setPage(1)
    setDisplayedLibertins([])
  }, [filters, users, libertins])

  useEffect(() => {
    setLoading(true)
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const newLibertins = filteredLibertins.slice(startIndex, endIndex)

    setDisplayedLibertins(prev => [
      ...prev,
      ...newLibertins.filter(
        newLibertin => !prev.some(libertin => libertin.id === newLibertin.id),
      ),
    ])
    setHasMore(endIndex < filteredLibertins.length)
    setLoading(false)
  }, [page, filteredLibertins])
  useEffect(() => {
    let filtered = libertinsWithUsers

    if (selectedProvince) {
      filtered = filtered.filter(
        e => findProvince(e.user.address.city) === selectedProvince,
      )
    }

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(e =>
        e.status.some(status => selectedStatuses.includes(status)),
      )
    }

    if (sortType) {
      filtered = filtered.filter(e => e.status.includes(sortType))
    }

    setFilteredLibertins(filtered)
  }, [selectedProvince, selectedStatuses, sortType, libertinsWithUsers])
  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value)
  }

  const handleSortChange = (type: SortType) => {
    setSortType(type)
  }

  return (
    <div>
      <EstablishmentsFilters
        provinceOptions={provinceOptions}
        selectedProvince={selectedProvince}
        onProvinceChange={handleProvinceChange}
        onProvinceReset={() => setSelectedProvince('')}
        sortType={sortType}
        onSortChange={handleSortChange}
      />
      <div className='announces-list px-5 grid grid-cols-2 gap-4'>
        {displayedLibertins.map((libertin, index) => (
          <div
            key={libertin.id}
            ref={
              index === displayedLibertins.length - 1
                ? lastLibertinElementRef
                : null
            }
          >
            <LibertinCard libertin={libertin} user={libertin.user} />
          </div>
        ))}
        {loading && (
          <div className='col-span-2 text-center'>
            Loading more libertins...
          </div>
        )}
      </div>
    </div>
  )
}

export default LibertinsHome
