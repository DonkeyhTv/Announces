import React, { useState } from 'react'
import MyButton from './buttons'
import SearchBar from './search-bar'
import BigFilter, { SearchFilters } from './BigFilter'
import { useTranslation } from 'react-i18next'

interface SearchResult {
  _id: string
  _source: {
    title: string
    description: string
  }
}

const HomeFilter = () => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(0)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    gender: [],
    distance: [],
    location: [],
  })

  const handleSearch = async (query: string) => {
    try {
      const response = await fetch('http://localhost:3333/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error searching Elasticsearch:', error)
    }
    setIsFilterOpen(false)
  }

  const toggleFilter = () => {
    setIsFilterOpen(prevState => !prevState)
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  return (
    <>
      <div className='max-w-7xl mx-auto flex justify-between space-x-4 my-5'>
        <SearchBar onSearch={handleSearch} className='w-85pourcent' />
        <MyButton
          variant='anthracite-redpink'
          className='w-1/5'
          onClick={toggleFilter}
        >
          {t('filter-announces')}
        </MyButton>
      </div>
      <div className={`filter-container ${isFilterOpen ? 'open mb-5' : ''}`}>
        <BigFilter
          isFilterOpen={isFilterOpen}
          toggleFilter={toggleFilter}
          onFiltersChange={handleFiltersChange}
        />
      </div>
      <div className='search-results'>
        {results.map((result: SearchResult) => (
          <div key={result._id}>
            <h3>{result._source.title}</h3>
            <p>{result._source.description}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export default HomeFilter
