import React, { useState, useEffect } from 'react'
import MySelect from './MySelect'
import MyMultiSelect from './MyMultiSelect'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  MdHeight,
  MdLanguage,
  MdLocationOn,
  MdOutlineTransgender,
  MdScale,
  MdStraighten,
} from 'react-icons/md'
import citiesData from '../../public/data/cities.json'
import { calculateDistance } from '../fonctions/calculateDistance'
import {
  ethnicityOptions,
  orientationOptions,
  genderOptions,
  eyesOptions,
  languageOptions,
  hairOptions,
  breastsOptions,
  zigounetteOptions,
  intimateOptions,
  nationalitiesOptions,
  distanceOptions,
  ageOptions,
  statusOptions,
  weightOptions,
  sizeOptions,
} from '../../public/data/options'
import { fetchPractices, PracticeCategory } from '../../services/practices'
import { Box, Grid } from '@mui/material'
import MyCheckbox from './MyCheckbox'
import {
  FaBirthdayCake,
  FaCar,
  FaCut,
  FaEye,
  FaFlag,
  FaGlobeAmericas,
  FaHeart,
  FaRegDotCircle,
} from 'react-icons/fa'
import { GiBodyHeight, GiUnderwearShorts, GiWeight } from 'react-icons/gi'
import { GoProjectRoadmap } from 'react-icons/go'

interface Option {
  value: string
  label: string
  latitude?: number
  longitude?: number
}

export interface SearchFilters {
  gender?: string[] | undefined
  distance?: string[] | undefined
  location?: string[] | undefined
  orientation?: string[] | undefined
  ageRange?: string[] | undefined
  status?: string[] | undefined
  weightRange?: string[] | undefined
  sizeRange?: string[] | undefined
  hairColor?: string[] | undefined
  eyeColor?: string[] | undefined
  intimateHairCut?: string[] | undefined
  ethnicity?: string[] | undefined
  nationality?: string[] | undefined
  languages?: string[] | undefined
  penisSize?: string[] | undefined
  braCup?: string[] | undefined
  tattoo?: boolean | null
  smoker?: boolean | null
  piercing?: boolean | null
  massageOnly?: boolean | null
  alcohol?: boolean | null
  isVerified?: boolean | null
  practices?: number[] | undefined
}

interface BigFilterProps {
  isFilterOpen: boolean
  toggleFilter: () => void
  onFiltersChange: (filters: SearchFilters) => void
}

const BigFilter: React.FC<BigFilterProps> = ({
  toggleFilter,
  onFiltersChange = () => {},
}) => {
  const { t } = useTranslation()
  const translateOptions = (options: Option[]): Option[] => {
    return options.map(option => ({
      ...option,
      label: t(`create-ad.${option.value}`),
    }))
  }
  const [, setPracticeCategories] = useState<PracticeCategory[]>([])
  const [practicesOptions, setPracticesOptions] = useState<Option[]>([])
  const translateNationalitiesOptions = (options: Option[]): Option[] => {
    return options.map(option => ({
      ...option,
      label: t(`nationalities.${option.value}`),
    }))
  }
  const translateLanguagesOptions = (options: Option[]): Option[] => {
    return options.map(option => ({
      ...option,
      label: t(`languages.${option.value}`),
    }))
  }
  const translatePracticesOptions = (options: Option[]): Option[] => {
    return options.map(option => ({
      ...option,
      label: t(`practices.${option.label}`),
    }))
  }
  const navigate = useNavigate()
  const location = useLocation()
  const [tempFilters, setTempFilters] = useState<SearchFilters>({
    gender: [],
    distance: [],
    location: [],
    orientation: [],
    ageRange: [],
    status: [],
    weightRange: [],
    sizeRange: [],
    hairColor: [],
    eyeColor: [],
    intimateHairCut: [],
    ethnicity: [],
    nationality: [],
    languages: [],
    penisSize: [],
    braCup: [],
    tattoo: null,
    smoker: null,
    piercing: null,
    massageOnly: null,
    alcohol: null,
    isVerified: null,
    practices: [] as number[],
  })
  const [locationOptions, setLocationOptions] = useState<Option[]>([])
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  type DistanceKey = '< 10km' | '< 20km' | '< 50km' | '< 75km' | '< 100km'
  const distanceRanges: { [key in DistanceKey]: number[] } = {
    '< 10km': [0, 10],
    '< 20km': [0, 20],
    '< 50km': [0, 50],
    '< 75km': [0, 75],
    '< 100km': [0, 100],
  }

  useEffect(() => {
    const fetchPracticesData = async () => {
      try {
        const categories = await fetchPractices()
        setPracticeCategories(categories)

        const options = categories.flatMap(category =>
          category.practices.map(practice => ({
            value: practice.id.toString(),
            label: practice.practiceName,
          })),
        )
        setPracticesOptions(options)
      } catch (error) {
        console.error('Failed to fetch practices:', error)
      }
    }

    fetchPracticesData()
  }, [])

  useEffect(() => {
    const savedFilters = localStorage.getItem('bigSearchFilters')
      ? (JSON.parse(
          localStorage.getItem('bigSearchFilters')!,
        ) as Partial<SearchFilters>)
      : {}

    setTempFilters({
      ...savedFilters,
      gender: savedFilters.gender || [],
      distance: savedFilters.distance || ['< 10km'],
      location: savedFilters.location || [],
      orientation: savedFilters.orientation || [],
      ageRange: savedFilters.ageRange || [],
    })
  }, [])

  useEffect(() => {
    const options = citiesData.flatMap(province =>
      province.cities.map(city => ({
        value: city.city_fr,
        label: `${city.city_fr} (${city.postal_code})`,
        latitude: city.latitude,
        longitude: city.longitude,
      })),
    )
    setLocationOptions(options)
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      })
    }
  }, [])

  const resetLocationOptions = () => {
    setLocationOptions(
      citiesData.flatMap(province =>
        province.cities.map(city => ({
          value: city.city_fr,
          label: `${city.city_fr} (${city.postal_code})`,
          latitude: city.latitude,
          longitude: city.longitude,
        })),
      ),
    )
  }

  const handleTempChange = (key: keyof SearchFilters, value: any) => {
    const updatedFilters = { ...tempFilters }

    switch (key) {
      case 'location':
        updatedFilters.location = value
        if (!value || value.length === 0) {
          updatedFilters.distance = undefined
          resetLocationOptions()
        } else if (!updatedFilters.distance) {
          updatedFilters.distance = ['< 10km']
        }
        break

      case 'distance':
        updatedFilters.distance = value ? [value] : undefined
        break

      case 'practices':
        updatedFilters.practices = value.map((v: string) => Number(v))
        break

      case 'ageRange':
        updatedFilters.ageRange = value
        break

      default:
        updatedFilters[key] = value
    }

    setTempFilters(updatedFilters)
    onFiltersChange(updatedFilters)
    localStorage.setItem('bigSearchFilters', JSON.stringify(updatedFilters))
  }

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()

    if (!tempFilters.distance || tempFilters.distance.length === 0) {
      tempFilters.distance = ['< 10km']
    }

    onFiltersChange(tempFilters)

    console.log('Big search filters:', tempFilters)

    filteredLocationOptions.forEach(option => {
      console.log('Filtered location option:', option)
    })

    localStorage.setItem('bigSearchFilters', JSON.stringify(tempFilters))
    toggleFilter()
    if (location.pathname === '/search/') {
      navigate(`/search/`)
      window.location.reload()
    } else {
      navigate('/search/')
    }
  }

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      gender: [],
      distance: ['< 10km'],
      location: [],
      orientation: [],
      ageRange: [],
      nationality: [],
      ethnicity: [],
      status: [],
      weightRange: [],
      sizeRange: [],
      hairColor: [],
      eyeColor: [],
      intimateHairCut: [],
      languages: [],
      penisSize: [],
      braCup: [],
      tattoo: null,
      smoker: null,
      piercing: null,
      massageOnly: null,
      alcohol: null,
      isVerified: null,
      practices: [],
    }
    setTempFilters(resetFilters)
    onFiltersChange(resetFilters)
    localStorage.setItem('bigSearchFilters', JSON.stringify(resetFilters))
  }

  const filterByDistance = (latitude: number, longitude: number): boolean => {
    if (!currentLocation) return true

    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      latitude,
      longitude,
    )

    if (!tempFilters.distance?.length) return true

    return tempFilters.distance.some(distanceKey => {
      const [minDistance, maxDistance] = distanceRanges[
        distanceKey as DistanceKey
      ] || [0, Infinity]
      return distance >= minDistance && distance <= maxDistance
    })
  }

  const filteredLocationOptions = locationOptions.filter(option => {
    const isSelected = tempFilters.location?.includes(option.value)
    const isWithinDistance = filterByDistance(
      option.latitude!,
      option.longitude!,
    )
    return isSelected || isWithinDistance
  })

  const handleCheckboxChange = (key: keyof SearchFilters) => {
    const currentValue = tempFilters[key]
    let newValue: boolean | null = currentValue === true ? null : true

    const updatedFilters = { ...tempFilters, [key]: newValue }
    setTempFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  return (
    <div className='bg-redpink p-6 h-auto'>
      <form className='w-full' onSubmit={handleSearch}>
        <div className='w-full mb-4'>
          <div className='relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.possibilities')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.possibilities')}
              options={translatePracticesOptions(practicesOptions)}
              value={(tempFilters.practices || []).map(String)}
              maxVisibleOptions={10}
              icon={<GoProjectRoadmap />}
              onChange={(value: string[]) =>
                handleTempChange('practices', value)
              }
              readOnly={false}
            />
          </div>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.gender')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.gender')}
              options={translateOptions(genderOptions)}
              value={tempFilters.gender || []}
              maxVisibleOptions={2}
              icon={<MdOutlineTransgender />}
              onChange={(value: any) => handleTempChange('gender', value)}
              readOnly={false}
            />
          </div>
          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.sexual-orientation')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.sexual-orientation')}
              options={translateOptions(orientationOptions)}
              value={tempFilters.orientation || []}
              maxVisibleOptions={2}
              icon={<FaHeart />}
              onChange={(value: any) => handleTempChange('orientation', value)}
              readOnly={false}
            />
          </div>
          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.location')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.location')}
              options={filteredLocationOptions}
              value={tempFilters.location || []}
              maxVisibleOptions={1}
              icon={<MdLocationOn />}
              onChange={(value: any) => handleTempChange('location', value)}
              readOnly={false}
            />
          </div>

          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.distance')}
              </div>
            </div>
            <MySelect
              label={t('distance')}
              options={distanceOptions}
              value={String(tempFilters.distance || '')}
              icon={<MdLocationOn />}
              onChange={value => handleTempChange('distance', value)}
              handleReset={() => handleReset()}
            />
          </div>

          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.age')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.age')}
              options={ageOptions.map(option => ({
                value: option.value,
                label: option.value,
              }))}
              value={tempFilters.ageRange || []}
              maxVisibleOptions={2}
              icon={<FaBirthdayCake className='text-xl' />}
              onChange={(value: string[]) =>
                handleTempChange('ageRange', value)
              }
              readOnly={false}
            />
          </div>
          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.type-of-meeting')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.type-of-meeting')}
              options={translateOptions(statusOptions)}
              value={tempFilters.status || []}
              maxVisibleOptions={1}
              icon={<FaCar />}
              onChange={(value: any) => handleTempChange('status', value)}
              readOnly={false}
            />
          </div>

          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.ethnicity')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.ethnicity')}
              options={translateOptions(ethnicityOptions)}
              value={tempFilters.ethnicity || []}
              maxVisibleOptions={2}
              icon={<FaGlobeAmericas />}
              onChange={(value: any) => handleTempChange('ethnicity', value)}
              readOnly={false}
            />
          </div>

          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.nationality')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.nationality')}
              options={translateNationalitiesOptions(nationalitiesOptions)}
              value={tempFilters.nationality || []}
              maxVisibleOptions={2}
              icon={<FaFlag />}
              onChange={(value: any) => handleTempChange('nationality', value)}
              readOnly={false}
            />
          </div>

          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.spoken-languages')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.spoken-languages')}
              options={translateLanguagesOptions(languageOptions)}
              value={tempFilters.languages || []}
              maxVisibleOptions={2}
              icon={<MdLanguage />}
              onChange={(value: any) => handleTempChange('languages', value)}
              readOnly={false}
            />
          </div>

          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.weight')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.weight')}
              options={weightOptions}
              value={tempFilters.weightRange || []}
              maxVisibleOptions={2}
              icon={<GiWeight />}
              onChange={(value: any) => handleTempChange('weightRange', value)}
              readOnly={false}
            />
          </div>

          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.size')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.size')}
              options={sizeOptions}
              value={tempFilters.sizeRange || []}
              maxVisibleOptions={2}
              icon={<GiBodyHeight />}
              onChange={(value: any) => handleTempChange('sizeRange', value)}
              readOnly={false}
            />
          </div>
          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.hair')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.hair')}
              options={translateOptions(hairOptions)}
              value={tempFilters.hairColor || []}
              maxVisibleOptions={2}
              icon={<FaCut />}
              onChange={(value: any) => handleTempChange('hairColor', value)}
              readOnly={false}
            />
          </div>

          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.eyes')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.eyes')}
              options={translateOptions(eyesOptions)}
              value={tempFilters.eyeColor || []}
              maxVisibleOptions={2}
              icon={<FaEye />}
              onChange={(value: any) => handleTempChange('eyeColor', value)}
              readOnly={false}
            />
          </div>

          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.intimate-haircut')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.intimate-haircut')}
              options={translateOptions(intimateOptions)}
              value={tempFilters.intimateHairCut || []}
              maxVisibleOptions={2}
              icon={<GiUnderwearShorts />}
              onChange={(value: any) =>
                handleTempChange('intimateHairCut', value)
              }
              readOnly={false}
            />
          </div>

          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.penis-size')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.penis-size')}
              options={zigounetteOptions}
              value={tempFilters.penisSize || []}
              maxVisibleOptions={2}
              icon={<MdStraighten />}
              onChange={(value: any) => handleTempChange('penisSize', value)}
              readOnly={false}
            />
          </div>

          <div className='col-span-1 relative'>
            <div className='title-style text-white text-center flex justify-center'>
              <div className='w-auto bg-anthracite px-2 rounded-t-lg text-sm'>
                {t('create-ad.breasts')}
              </div>
            </div>
            <MyMultiSelect
              label={t('create-ad.breasts')}
              options={translateOptions(breastsOptions)}
              value={tempFilters.braCup || []}
              maxVisibleOptions={1}
              icon={<FaRegDotCircle />}
              onChange={(value: any) => handleTempChange('braCup', value)}
              readOnly={false}
            />
          </div>
        </div>

        <div className='bigFilterCheckboxes relative w-full mt-9'>
          <div className='bigFilterCheckboxes relative w-full'>
            <div className='grid grid-cols-6 gap-4'>
              <Grid>
                <label>
                  <Box className='w-full rounded-lg cursor-pointer'>
                    <MyCheckbox
                      name='tattoos'
                      label={t('create-ad.tattoos')}
                      checked={tempFilters.tattoo ?? false}
                      onChange={() => handleCheckboxChange('tattoo')}
                      variant='bgWhite'
                      className='rounded-md'
                    />
                  </Box>
                </label>
              </Grid>
              <Grid>
                <label>
                  <Box className='w-full rounded-lg cursor-pointer'>
                    <MyCheckbox
                      name='smoker'
                      label={t('create-ad.smoker')}
                      checked={tempFilters.smoker ?? false}
                      onChange={() => handleCheckboxChange('smoker')}
                      variant='bgWhite'
                      className='rounded-md'
                    />
                  </Box>
                </label>
              </Grid>
              <Grid>
                <label>
                  <Box className='w-full rounded-lg cursor-pointer'>
                    <MyCheckbox
                      name='piercings'
                      label={t('create-ad.piercings')}
                      checked={tempFilters.piercing ?? false}
                      onChange={() => handleCheckboxChange('piercing')}
                      variant='bgWhite'
                      className='rounded-md'
                    />
                  </Box>
                </label>
              </Grid>
              <Grid>
                <label>
                  <Box className='w-full rounded-lg cursor-pointer'>
                    <MyCheckbox
                      name='massageOnly'
                      label={t('create-ad.professional-massage')}
                      checked={tempFilters.massageOnly === true}
                      onChange={() => handleCheckboxChange('massageOnly')}
                      variant='bgWhite'
                      className='rounded-md'
                    />
                  </Box>
                </label>
              </Grid>
              <Grid>
                <label>
                  <Box className='w-full rounded-lg cursor-pointer'>
                    <MyCheckbox
                      name='alcohol'
                      label={t('create-ad.alcohol')}
                      checked={tempFilters.alcohol === true}
                      onChange={() => handleCheckboxChange('alcohol')}
                      variant='bgWhite'
                      className='rounded-md'
                    />
                  </Box>
                </label>
              </Grid>
              <Grid>
                <label>
                  <Box className='w-full rounded-lg cursor-pointer'>
                    <MyCheckbox
                      name='isVerified'
                      label={t('create-ad.profiles-verified')}
                      checked={tempFilters.isVerified === true}
                      onChange={() => handleCheckboxChange('isVerified')}
                      variant='bgWhite'
                      className='rounded-md'
                    />
                  </Box>
                </label>
              </Grid>
            </div>
          </div>
        </div>
      </form>

      <div className='flex justify-between w-full text-center mt-5 mb-5'>
        <button
          className='bg-anthracite text-white rounded-lg px-4 py-4 mt-4 mr-2 text-center uppercase hover:text-redpink transition-all'
          onClick={handleReset}
        >
          {t('reset')}
        </button>
        <Link
          to='/search/'
          className='bg-anthracite text-white rounded-lg px-4 py-4 mt-4 text-center uppercase hover:text-redpink transition-all'
          onClick={handleSearch}
        >
          {t('search')}
        </Link>
      </div>
    </div>
  )
}

export default BigFilter
