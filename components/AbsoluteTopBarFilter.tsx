import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import MySelect from './MySelect'
import { useTranslation } from 'react-i18next'
import { Grid, Box } from '@mui/material'
import MyCheckbox from './MyCheckbox'
import { useSearchFilters } from './SearchFiltersContext'
import citiesData from '../../public/data/cities.json'

interface Option {
  value: string
  label: string
  latitude?: number
  longitude?: number
}

export default function AbsoluteTopBarFilter() {
  const { filters, setFilters } = useSearchFilters()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [tempFilters, setTempFilters] = useState(filters)
  const [locationOptions, setLocationOptions] = useState<Option[]>([])
  const [, setCurrentLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

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

  const handleTempChange = (key: keyof typeof filters, value: any) => {
    const updatedFilters = {
      ...tempFilters,
      [key]:
        key === 'rememberFilters'
          ? value
          : Array.isArray(value)
          ? value
          : [value],
    }
    setTempFilters(updatedFilters)
  }

  const cleanFilters = (filters: typeof tempFilters) => {
    return {
      ...filters,
      imLookingFor: filters.imLookingFor.filter((item: string) => item !== ''),
      orientation: filters.orientation.filter((item: string) => item !== ''),
      iLiveIn: filters.iLiveIn.filter((item: string) => item !== ''),
      distance: filters.distance.filter((item: string) => item !== ''),
    }
  }

  const handleSearch = () => {
    const cleanedFilters = cleanFilters(tempFilters)
    setFilters(cleanedFilters)
    const timestamp = new Date().getTime()
    if (location.pathname === '/search/') {
      navigate(`/?search=${timestamp}`)
    }
  }

  useEffect(() => {
    if (!tempFilters.rememberFilters) {
      setFilters({
        imLookingFor: [],
        orientation: [],
        iLiveIn: [],
        distance: [],
        rememberFilters: false,
      })
    }
  }, [navigate])

  const handleReset = (key: keyof typeof filters) => {
    handleTempChange(key, key === 'rememberFilters' ? false : [])
  }

  const imLookingForOptions = [
    { value: 'woman', label: t('create-ad.woman') },
    { value: 'man', label: t('create-ad.man') },
    { value: 'couple', label: t('create-ad.couple') },
    { value: 'transgender', label: t('create-ad.transgender') },
  ]

  const orientationOptions = [
    { value: 'heterosexual', label: t('create-ad.heterosexual') },
    { value: 'bisexual', label: t('create-ad.bi') },
    { value: 'homosexual', label: t('create-ad.homosexual') },
  ]

  const distanceOptions = [
    { value: '< 10km', label: '< 10km' },
    { value: '< 20km', label: '< 20km' },
    { value: '< 50km', label: '< 50km' },
    { value: '< 75km', label: '< 75km' },
    { value: '< 100km', label: '< 100km' },
  ]

  return (
    <div className='flex-grow filter-top p-0 m-0'>
      <form className='w-full flex-grow p-0 m-0' onSubmit={handleSearch}>
        <div className='grid grid-cols-5 gap-4 p-0 m-0'>
          <div className='col-span-1 h-40px pr-5'>
            <div className='text-center uppercase text-xl mb-2'>
              {t('im-looking-for')}
            </div>
            <MySelect
              label={t('im-looking-for')}
              variant='outlined'
              options={imLookingForOptions}
              value={tempFilters.imLookingFor.join(',')}
              onChange={value => handleTempChange('imLookingFor', value)}
              handleReset={() => handleReset('imLookingFor')}
              className='flex-grow w-full cursor-pointer h-40px text-sm rounded-md bg-white focus:outline-none focus:ring text-anthracite font-semibold focus:ring-redpink'
            />
          </div>
          <div className='col-span-1 h-40px pr-5'>
            <div className='text-center uppercase text-xl mb-2'>
              {t('orientation')}
            </div>
            <MySelect
              label={t('orientation')}
              variant='outlined'
              options={orientationOptions}
              value={tempFilters.orientation.join(',')}
              onChange={value => handleTempChange('orientation', value)}
              handleReset={() => handleReset('orientation')}
              className='flex-grow w-full cursor-pointer h-40px text-sm rounded-md bg-white focus:outline-none focus:ring text-anthracite font-semibold focus:ring-redpink'
            />
          </div>
          <div className='col-span-1 h-40px pr-5'>
            <div className='text-center uppercase text-xl mb-2'>
              {t('i-live-in')}
            </div>
            <MySelect
              label={t('i-live-in')}
              variant='outlined'
              options={locationOptions}
              value={tempFilters.iLiveIn.join(',')}
              onChange={value => handleTempChange('iLiveIn', value)}
              handleReset={() => handleReset('iLiveIn')}
              className='flex-grow w-full cursor-pointer h-40px text-sm rounded-md bg-white focus:outline-none focus:ring text-anthracite font-semibold focus:ring-redpink'
            />
          </div>
          <div className='col-span-1 h-40px pr-5'>
            <div className='text-center uppercase text-xl mb-2'>
              {t('distance')}
            </div>
            <MySelect
              label={t('distance')}
              variant='outlined'
              options={distanceOptions}
              value={tempFilters.distance.join(',')}
              onChange={value => handleTempChange('distance', value)}
              handleReset={() => handleReset('distance')}
              className='flex-grow w-full cursor-pointer h-40px text-sm rounded-md bg-white focus:outline-none focus:ring text-anthracite font-semibold focus:ring-redpink'
            />
          </div>
          <div className='col-span-1 items-center'>
            <Grid>
              <label>
                <Box className='w-full text-sm rounded-lg cursor-pointer flex justify-center'>
                  <MyCheckbox
                    name='rememberFilters'
                    label={t('remember-filters')}
                    checked={tempFilters.rememberFilters}
                    required={false}
                    onChange={checked =>
                      handleTempChange('rememberFilters', checked)
                    }
                    variant='noBg'
                  />
                </Box>
              </label>
            </Grid>

            <div className='block'>
              <button
                type='submit'
                className='mt-0 w-full bg-redpink hover:text-anthracite transition-all text-white font-lightbold h-40px px-4 rounded'
              >
                {t('search')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
