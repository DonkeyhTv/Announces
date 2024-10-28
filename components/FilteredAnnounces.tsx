import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ProfileCard from './ProfileCard'
import { Announce } from '../interfaces/announce'
import { User } from '../interfaces/user'
import { fetchUsers } from '../../services/fetchAllUser'
import calculateAge from '../fonctions/calculateAge'
import { API_BASE_URL } from '../../services/api'

const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}

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

const FilteredAnnounces: React.FC = () => {
  const [announces, setAnnounces] = useState<Announce[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [filteredAnnounces, setFilteredAnnounces] = useState<Announce[]>([])
  const navigate = useNavigate()
  const query = useQuery()

  const jeCherche = query.get('jeCherche') || ''
  const orientation = query.get('orientation') || ''
  const jhabite = query.get('jhabite') || ''
  const distance = query.get('distance') || ''
  const [statusToShow] = useState(1)

  useEffect(() => {
    if (!jeCherche && !orientation && !jhabite && !distance) {
      navigate('/')
      return
    }

    const fetchData = async () => {
      try {
        const usersData = await fetchUsers()
        setUsers(usersData)

        const response = await fetch(`${API_BASE_URL}/announces`)
        if (!response.ok) {
          throw new Error('Failed to fetch announces')
        }
        const data = await response.json()
        const announceIds = data.map((announce: { id: string }) => announce.id)

        const announceDetails = await Promise.all(
          announceIds.map(async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/announces/${id}`)
            if (!response.ok) {
              throw new Error(`Failed to fetch details for announce ${id}`)
            }
            const announceData = await response.json()

            const user = usersData.find(
              user => user.id === announceData.announce.userId,
            )

            const filteredGallery = (announceData.gallery || []).filter(
              (img: any) =>
                img.status.toString().includes(statusToShow.toString()),
            )

            return {
              ...announceData.announce,
              age: user ? calculateAge(user.birthday) : null,
              user: user || {
                id: 0,
                birthday: '',
                nickname: '',
                userProfile: { gender: '', orientation: '' },
                address: { city: '' },
              },
              galleryUrl:
                filteredGallery.find((img: any) => img.cover)?.fileUrl ||
                filteredGallery[0]?.fileUrl ||
                defaultImageUrl(user?.userProfile?.gender),
              gallery: filteredGallery,
            }
          }),
        )

        setAnnounces(announceDetails)
        applyFilters(announceDetails)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [jeCherche, orientation, jhabite, distance, navigate, statusToShow])

  const applyFilters = (announces: Announce[]) => {
    const filtered = announces.filter(announce => {
      const user = announce.user
      const userProfile = users.find(u => u.id === user.id)?.userProfile

      const matchesGender = userProfile?.gender === jeCherche

      return matchesGender
    })
    setFilteredAnnounces(filtered)
  }

  useEffect(() => {
    applyFilters(announces)
  }, [jeCherche, announces, users])

  return (
    <div className='announces-list p-5'>
      {filteredAnnounces.map(announce => (
        <ProfileCard
          key={announce.id}
          announce={announce}
          user={announce.user}
          statusToShow={statusToShow}
          gallery={announce.gallery || []}
        />
      ))}
    </div>
  )
}

export default FilteredAnnounces
