import React from 'react'
import { useTranslation } from 'react-i18next'
import MySelect from './MySelect'
import { FaLocationDot } from 'react-icons/fa6'

interface ProvinceOption {
  value: string
  label: string
}

type SortType =
  | ''
  | 'maison privee'
  | 'bars et clubs prive'
  | 'hotels coquins'
  | 'saunas prives'
  | 'salons de massage'
  | 'clubs echangistes'

interface EventFiltersProps {
  provinceOptions: ProvinceOption[]
  selectedProvince: string
  onProvinceChange: (value: string) => void
  onProvinceReset: () => void
  sortType: SortType
  onSortChange: (type: SortType) => void
}

const EstablishmentsFilters: React.FC<EventFiltersProps> = ({
  provinceOptions,
  selectedProvince,
  onProvinceChange,
  onProvinceReset,
  sortType,
  onSortChange,
}) => {
  const { t } = useTranslation()

  const handleSort = (type: SortType) => {
    onSortChange(type === sortType ? '' : type)
  }

  return (
    <div>
      <div className='mb-5 flex mx-auto w-full max-w-7xl space-x-4'>
        <MySelect
          label={t('filter-by-province')}
          options={provinceOptions}
          value={selectedProvince}
          onChange={onProvinceChange}
          handleReset={onProvinceReset}
          className='w-full border-none'
          initialValue=''
          icon={<FaLocationDot />}
          variant='establishmentFilter'
        />
      </div>
      <div className='mb-5 flex mx-auto w-full max-w-7xl space-x-4'>
        {[
          'maison privee',
          'bars et clubs prive',
          'hotels coquins',
          'saunas prives',
          'salons de massage',
          'clubs echangistes',
        ].map(type => (
          <button
            key={type}
            onClick={() => handleSort(type as SortType)}
            className={`px-4 py-2 rounded w-1/6 ${
              sortType === type
                ? 'bg-redpink text-white'
                : 'bg-grisclair text-anthracite hover:bg-grisclair2'
            }`}
          >
            {t(`create-ad.${type}`)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default EstablishmentsFilters
