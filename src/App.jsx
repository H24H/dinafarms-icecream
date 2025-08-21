import { useEffect, useState } from 'react'
import { MapPin, Phone, Navigation, ChevronRight } from 'lucide-react'
import './App.css'
import dinaFarmsLogo from './assets/dina-farms-logo.png'
import Papa from 'papaparse'

// بيانات افتراضية - سيتم استخدامها إذا فشل تحميل ملف CSV
const sampleCities = [
  { id: 1, name: 'القاهرة' },
  { id: 2, name: 'الجيزة' }
]

const sampleRegionsByCity = {
  'القاهرة': [
    { id: 1, name: 'الكل' }
  ],
  'الجيزة': [
    { id: 1, name: 'الكل' }
  ]
}

const sampleBranchesByRegion = {
  'الكل': [
    {
      id: 1,
      name: 'فرع تجريبي',
      address: 'العنوان التجريبي',
      phone: '',
    }
  ]
}

function buildSampleNestedData() {
  const nested = {}
  for (const cityName of Object.keys(sampleRegionsByCity)) {
    nested[cityName] = {}
    const cityRegions = sampleRegionsByCity[cityName]
    for (const region of cityRegions) {
      nested[cityName][region.name] = sampleBranchesByRegion[region.name] || []
    }
  }
  return nested
}

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedBranch, setSelectedBranch] = useState(null)

  const [csvCities, setCsvCities] = useState(null) // [{id,name}]
  const [csvRegionsByCity, setCsvRegionsByCity] = useState(null) // { [city]: [{id,name}] }
  const [csvBranchesByRegion, setCsvBranchesByRegion] = useState(null) // { [region]: Branch[] }
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [dataError, setDataError] = useState('')

  useEffect(() => {
    async function loadCsv() {
      try {
        setIsLoadingData(true)
        setDataError('')
        const url = `${import.meta.env.BASE_URL || '/'}cities.csv`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`فشل في جلب ملف CSV: ${response.status}`)
        }
        
        // Decode strictly as UTF-8 and strip BOM if present
        const buffer = await response.arrayBuffer()
        const decoder = new TextDecoder('utf-8')
        let csvText = decoder.decode(buffer)
        if (csvText.charCodeAt(0) === 0xFEFF) {
          csvText = csvText.slice(1)
        }

        const parsed = Papa.parse(csvText, { 
          header: true, 
          skipEmptyLines: true
        })
        const rows = Array.isArray(parsed.data) ? parsed.data : []

        const citySet = new Set()
        const regionsByCityMap = {}
        const branchesByRegionMap = {}
        let branchIdCounter = 1
        let regionIdCounters = {}

        const getField = (row, key) => {
          const direct = row[key]
          if (direct !== undefined && direct !== null && `${direct}`.trim() !== '') return `${direct}`.trim()
          // case-insensitive
          const lowerMap = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]))
          const v = lowerMap[key.toLowerCase()]
          if (v !== undefined && v !== null && `${v}`.trim() !== '') return `${v}`.trim()
          return ''
        }

        for (const row of rows) {
          const cityName = getField(row, 'gov') || 'غير محدد'
          const regionName = getField(row, 'area') || 'الكل'
          const branchName = getField(row, 'cutomer')
          const address = getField(row, 'address')
          const phone = getField(row, 'tel')
          const latitudeRaw = row['Latitude']
          const longitudeRaw = row['Longitude']

          if (!branchName) continue

          citySet.add(cityName)

          if (!regionsByCityMap[cityName]) {
            regionsByCityMap[cityName] = []
            regionIdCounters[cityName] = 1
          }
          if (!regionsByCityMap[cityName].some(r => r.name === regionName)) {
            regionsByCityMap[cityName].push({ id: regionIdCounters[cityName]++, name: regionName })
          }

          if (!branchesByRegionMap[regionName]) branchesByRegionMap[regionName] = []
          const latitude = (latitudeRaw !== undefined && `${latitudeRaw}`.toUpperCase?.() !== 'NULL' && `${latitudeRaw}`.trim() !== '' && `${latitudeRaw}`.toLowerCase() !== 'not found') ? Number(latitudeRaw) : undefined
          const longitude = (longitudeRaw !== undefined && `${longitudeRaw}`.toUpperCase?.() !== 'NULL' && `${longitudeRaw}`.trim() !== '' && `${longitudeRaw}`.toLowerCase() !== 'not found') ? Number(longitudeRaw) : undefined
          branchesByRegionMap[regionName].push({
            id: branchIdCounter++,
            name: branchName,
            address,
            phone: phone ? String(phone) : '',
            coordinates: (latitude !== undefined && longitude !== undefined) ? { lat: latitude, lng: longitude } : undefined,
          })
        }

        const citiesArray = Array.from(citySet).map((name, idx) => ({ id: idx + 1, name }))
        citiesArray.sort((a, b) => a.name.localeCompare(b.name, 'ar'))
        for (const city of Object.keys(regionsByCityMap)) {
          regionsByCityMap[city].sort((a, b) => a.name.localeCompare(b.name, 'ar'))
        }
        for (const region of Object.keys(branchesByRegionMap)) {
          branchesByRegionMap[region].sort((a, b) => a.name.localeCompare(b.name, 'ar'))
        }

        setCsvCities(citiesArray)
        setCsvRegionsByCity(regionsByCityMap)
        setCsvBranchesByRegion(branchesByRegionMap)
      } catch (error) {
        console.error(error)
        setDataError('تعذر تحميل بيانات الفروع. سيتم استخدام بيانات تجريبية.')
        setCsvCities(null)
        setCsvRegionsByCity(null)
        setCsvBranchesByRegion(null)
      } finally {
        setIsLoadingData(false)
      }
    }
    loadCsv()
  }, [])

  const handleCitySelect = (city) => {
    setSelectedCity(city)
    setSelectedRegion('')
    setSelectedBranch(null)
    setCurrentStep(2)
  }

  const handleRegionSelect = (region) => {
    setSelectedRegion(region)
    setSelectedBranch(null)
    setCurrentStep(3)
  }

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch)
    setCurrentStep(4)
  }

  const resetSelection = () => {
    setSelectedCity('')
    setSelectedRegion('')
    setSelectedBranch(null)
    setCurrentStep(1)
  }

  const getGoogleMapsUrl = (address) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  }

  const getGoogleMapsEmbedUrl = (address) => {
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(address)}`
  }

  const handlePhoneClick = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self')
  }

  const cities = (csvCities && csvCities.length > 0) ? csvCities : sampleCities
  const regions = (csvRegionsByCity && Object.keys(csvRegionsByCity).length > 0) ? csvRegionsByCity : sampleRegionsByCity
  const branches = (csvBranchesByRegion && Object.keys(csvBranchesByRegion).length > 0) ? csvBranchesByRegion : sampleBranchesByRegion

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <div className="logo-container">
            <img 
              src={dinaFarmsLogo}
              alt="شعار دينا فارمز" 
              className="logo-image"
            />
          </div>
          <h1>  
          آيس كريم مزارع دينا  </h1>
          <p className="subtitle">اعثر على أقرب منفذ لمزارع دينا خلال 4 خطوات بسيطة</p>
          {dataError && (
            <p className="subtitle" style={{ color: '#b45309' }}>{dataError}</p>
          )}
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`progress-step ${currentStep >= step ? 'active' : ''}`}
              >
                <div className="step-number">{step}</div>
                <div className="step-label">
                  {step === 1 ? 'المحافظة' : step === 2 ? 'المنطقة' : step === 3 ? 'الفرع' : 'التفاصيل'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content">
          {isLoadingData && (
            <div className="step-content">
              <h2>جاري تحميل البيانات...</h2>
            </div>
          )}
          {currentStep === 1 && (
            <div className="step-content">
              <h2>الخطوة 1: اختر المحافظة</h2>
              <div className="options-grid">
                {cities.map((city) => (
                  <div
                    key={city.id}
                    className="option-card"
                    onClick={() => handleCitySelect(city.name)}
                  >
                    <h3>{city.name}</h3>
                    <ChevronRight className="arrow-icon" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <div className="step-header">
                <button
                  className="back-button"
                  onClick={() => setCurrentStep(1)}
                >
                  رجوع إلى المحافظات
                </button>
                <h2>الخطوة 2: اختر المنطقة في {selectedCity}</h2>
              </div>
              <div className="options-grid">
                {regions[selectedCity]?.map((region) => (
                  <div
                    key={region.id}
                    className="option-card"
                    onClick={() => handleRegionSelect(region.name)}
                  >
                    <h3>{region.name}</h3>
                    <ChevronRight className="arrow-icon" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-content">
              <div className="step-header">
                <button
                  className="back-button"
                  onClick={() => setCurrentStep(2)}
                >
                  رجوع إلى المناطق
                </button>
                <h2>الخطوة 3: اختر الفرع في {selectedRegion}</h2>
              </div>
              <div className="options-grid">
                {branches[selectedRegion]?.map((branch) => (
                  <div
                    key={branch.id}
                    className="option-card"
                    onClick={() => handleBranchSelect(branch)}
                  >
                    <h3>{branch.name}</h3>
                    <p className="branch-address">{branch.address}</p>
                    <ChevronRight className="arrow-icon" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && selectedBranch && (
            <div className="step-content">
              <div className="step-header">
                <button
                  className="back-button"
                  onClick={() => setCurrentStep(3)}
                >
                  رجوع إلى الفروع
                </button>
                <h2>الخطوة 4: تفاصيل الفرع</h2>
              </div>

              <div className="branch-details">
                <div className="branch-card">
                  <div className="branch-header">
                    <h2>{selectedBranch.name}</h2>
                    <button
                      className="reset-button"
                      onClick={resetSelection}
                    >
                      ابدأ من جديد
                    </button>
                  </div>

                  <div className="branch-info">
                    <div className="info-item">
                      <MapPin className="info-icon" />
                      <div className="info-content">
                        <strong>العنوان:</strong>
                        <p>{selectedBranch.address}</p>
                      </div>
                      <button
                        className="action-button maps-button"
                        onClick={() => window.open(getGoogleMapsUrl(selectedBranch.address), '_blank')}
                        title="افتح في خرائط جوجل"
                      >
                        <Navigation className="action-icon" />
                        خرائط
                      </button>
                    </div>

                    {selectedBranch.phone && (
                      <div className="info-item">
                        <Phone className="info-icon" />
                        <div className="info-content">
                          <strong>الهاتف:</strong>
                          <p className="phone-number">{selectedBranch.phone}</p>
                        </div>
                        <button
                          className="action-button call-button"
                          onClick={() => handlePhoneClick(selectedBranch.phone)}
                          title="اتصل الآن"
                        >
                          <Phone className="action-icon" />
                          اتصل
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="map-widget">
                    <h3>العنوان</h3>
                    <div className="map-container">
                      <iframe
                        title={`خريطة ${selectedBranch.name}`}
                        src={getGoogleMapsEmbedUrl(selectedBranch.address)}
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  </div>

                  <div className="branch-actions">
               
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
