import { useState } from 'react'
import { MapPin, Phone, Navigation, ChevronRight } from 'lucide-react'
import './App.css'
import dinaFarmsLogo from './assets/dina-farms-logo.png'

// Sample data - in a real app, this would come from an API
const cities = [
  { id: 1, name: 'Cairo' },
  { id: 2, name: 'Alexandria' },
  { id: 3, name: 'Giza' },
  { id: 4, name: 'Sharm El Sheikh' },
  { id: 5, name: 'Hurghada' }
]

const regions = {
  Cairo: [
    { id: 1, name: 'Maadi' },
    { id: 2, name: 'Heliopolis' },
    { id: 3, name: 'Zamalek' },
    { id: 4, name: 'Nasr City' },
    { id: 5, name: '6th of October' }
  ],
  Alexandria: [
    { id: 1, name: 'Miami' },
    { id: 2, name: 'Stanley' },
    { id: 3, name: 'Sidi Gaber' },
    { id: 4, name: 'Montazah' }
  ],
  Giza: [
    { id: 1, name: 'Dokki' },
    { id: 2, name: 'Mohandessin' },
    { id: 3, name: 'Agouza' },
    { id: 4, name: 'Haram' }
  ],
  'Sharm El Sheikh': [
    { id: 1, name: 'Naama Bay' },
    { id: 2, name: 'Old Market' },
    { id: 3, name: 'Hadaba' }
  ],
  Hurghada: [
    { id: 1, name: 'Sahl Hasheesh' },
    { id: 2, name: 'El Gouna' },
    { id: 3, name: 'Downtown' }
  ]
}

const branches = {
  'Maadi': [
    {
      id: 1,
      name: 'Dina Farms Maadi Branch',
      address: '123 Road 9, Maadi, Cairo, Egypt',
      phone: '+20 2 2358 1234',
      coordinates: { lat: 29.9627, lng: 31.2671 }
    },
    {
      id: 2,
      name: 'Dina Farms Maadi Corniche',
      address: '45 Corniche El Nile, Maadi, Cairo, Egypt',
      phone: '+20 2 2358 5678',
      coordinates: { lat: 29.9600, lng: 31.2650 }
    }
  ],
  'Heliopolis': [
    {
      id: 3,
      name: 'Dina Farms Heliopolis',
      address: '78 Abbas El Akkad St, Heliopolis, Cairo, Egypt',
      phone: '+20 2 2418 9012',
      coordinates: { lat: 30.0869, lng: 31.3267 }
    }
  ],
  'Zamalek': [
    {
      id: 4,
      name: 'Dina Farms Zamalek',
      address: '15 26th of July St, Zamalek, Cairo, Egypt',
      phone: '+20 2 2735 3456',
      coordinates: { lat: 30.0588, lng: 31.2238 }
    }
  ]
}

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedBranch, setSelectedBranch] = useState(null)

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

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <div className="logo-container">
            <img 
              src={dinaFarmsLogo}
              alt="Dina Farms Logo" 
              className="logo-image"
            />
          </div>
          <h1>Dina Farms Ice Cream Finder</h1>
          <p className="subtitle">Find your nearest Dina Farms branch in just 3 simple steps</p>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`progress-step ${currentStep >= step ? 'active' : ''}`}
              >
                <div className="step-number">{step}</div>
                <div className="step-label">
                  {step === 1 ? 'City' : step === 2 ? 'Region' : 'Branch'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content">
          {currentStep === 1 && (
            <div className="step-content">
              <h2>Step 1: Select Your City</h2>
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
                  ← Back to Cities
                </button>
                <h2>Step 2: Select Your Region in {selectedCity}</h2>
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
                  ← Back to Regions
                </button>
                <h2>Step 3: Select Your Branch in {selectedRegion}</h2>
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

          {selectedBranch && (
            <div className="branch-details">
              <div className="branch-card">
                <div className="branch-header">
                  <h2>{selectedBranch.name}</h2>
                  <button
                    className="reset-button"
                    onClick={resetSelection}
                  >
                    Start Over
                  </button>
                </div>
                
                <div className="branch-info">
                  <div className="info-item">
                    <MapPin className="info-icon" />
                    <div>
                      <strong>Address:</strong>
                      <p>{selectedBranch.address}</p>
                    </div>
                  </div>
                  
                  <div className="info-item clickable" onClick={() => handlePhoneClick(selectedBranch.phone)}>
                    <Phone className="info-icon" />
                    <div>
                      <strong>Phone:</strong>
                      <p className="phone-number">{selectedBranch.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="map-widget">
                  <h3>Location</h3>
                  <div className="map-container">
                    <iframe
                      title={`Map of ${selectedBranch.name}`}
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
                  <a
                    href={getGoogleMapsUrl(selectedBranch.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-button"
                  >
                    <Navigation className="map-icon" />
                    Open in Google Maps
                  </a>
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
