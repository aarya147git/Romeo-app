import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Filter,
  DollarSign,
  ShieldCheck,
  Heart,
  SlidersHorizontal,
  Home,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpDown,
  Share2,
  Columns
} from 'lucide-react';
import { PropertyListing } from '../types';

interface RoomSearchProps {
  properties: PropertyListing[];
  onSelectProperty: (property: PropertyListing) => void;
  onToggleSave: (id: string) => void;
  savedIds: string[];
  compareList: PropertyListing[];
  onToggleCompare: (property: PropertyListing) => void;
  onOpenCompareModal: () => void;
  initialCity?: string;
}

export const RoomSearch: React.FC<RoomSearchProps> = ({
  properties,
  onSelectProperty,
  onToggleSave,
  savedIds,
  compareList,
  onToggleCompare,
  onOpenCompareModal,
  initialCity,
}) => {
  const [cityFilter, setCityFilter] = useState<string>(initialCity || 'all');
  const [localityQuery, setLocalityQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [furnishingFilter, setFurnishingFilter] = useState<string>('all');
  const [maxRent, setMaxRent] = useState<number>(35000);
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'rent_asc' | 'rent_desc'>('recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (cityFilter !== 'all' && p.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
      if (localityQuery.trim() && !p.locality.toLowerCase().includes(localityQuery.toLowerCase())) return false;
      if (typeFilter !== 'all' && p.propertyType !== typeFilter) return false;
      if (genderFilter !== 'all') {
        if (genderFilter === 'Female Only' && p.genderEligibility !== 'Female Only' && p.genderEligibility !== 'Co-ed / Any') return false;
        if (genderFilter === 'Male Only' && p.genderEligibility !== 'Male Only' && p.genderEligibility !== 'Co-ed / Any') return false;
      }
      if (furnishingFilter !== 'all' && p.furnishing !== furnishingFilter) return false;
      if (p.monthlyRent > maxRent) return false;
      if (selectedAmenity !== 'all' && !p.amenities.some(a => a.toLowerCase().includes(selectedAmenity.toLowerCase()))) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rent_asc') return a.monthlyRent - b.monthlyRent;
      if (sortBy === 'rent_desc') return b.monthlyRent - a.monthlyRent;
      return 0; // recommended
    });
  }, [properties, cityFilter, localityQuery, typeFilter, genderFilter, furnishingFilter, maxRent, selectedAmenity, sortBy]);

  const resetFilters = () => {
    setCityFilter('all');
    setLocalityQuery('');
    setTypeFilter('all');
    setGenderFilter('all');
    setFurnishingFilter('all');
    setMaxRent(35000);
    setSelectedAmenity('all');
    setSortBy('recommended');
  };

  return (
    <div id="marketplace-anchor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-20">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-violet-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Home className="w-4 h-4" />
            <span>Accommodation Marketplace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Explore Verified PGs, Flats & Shared Rooms
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Showing {filteredProperties.length} verified listings with transparent fee breakdowns & house rules.
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 mr-2" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="ml-1.5 bg-transparent border-none text-stone-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="rent_asc">Rent: Low to High</option>
              <option value="rent_desc">Rent: High to Low</option>
            </select>
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Mobile Active Filter Bar & Open Button */}
      <div className="md:hidden flex items-center justify-between gap-2 mb-4 p-2.5 bg-white rounded-2xl border border-stone-200">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <span className="font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg shrink-0">
            {cityFilter === 'all' ? 'All Cities' : cityFilter}
          </span>
          <span className="text-stone-600 bg-stone-100 px-2 py-1 rounded-lg shrink-0">
            ≤ ₹{maxRent / 1000}k
          </span>
          {typeFilter !== 'all' && (
            <span className="text-violet-700 bg-violet-50 px-2 py-1 rounded-lg shrink-0 font-semibold">
              {typeFilter}
            </span>
          )}
        </div>
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Bar (Desktop) */}
      <div className="hidden md:block bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* City */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              City
            </label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">All Cities</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Pune">Pune</option>
            </select>
          </div>

          {/* Locality Search */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Locality / Area
            </label>
            <div className="relative">
              <input
                type="text"
                value={localityQuery}
                onChange={(e) => setLocalityQuery(e.target.value)}
                placeholder="e.g. Koramangala, Powai"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-3 pr-8 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              {localityQuery && (
                <button
                  onClick={() => setLocalityQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Accommodation Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="pg">Coliving / PG</option>
              <option value="flat">Independent Flat</option>
              <option value="private_room">Private Room in Flat</option>
            </select>
          </div>

          {/* Gender Eligibility */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Gender Eligibility
            </label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">Any / Co-ed</option>
              <option value="Female Only">Female Only</option>
              <option value="Male Only">Male Only</option>
            </select>
          </div>

          {/* Furnishing */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Furnishing
            </label>
            <select
              value={furnishingFilter}
              onChange={(e) => setFurnishingFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">All Furnishings</option>
              <option value="Fully Furnished">Fully Furnished</option>
              <option value="Semi Furnished">Semi Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
          </div>
        </div>

        {/* Secondary Row: Budget Slider & Quick Amenity Chips */}
        <div className="pt-2 border-t border-stone-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Budget Range */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-stone-600 shrink-0">
              Max Monthly Rent: <strong className="text-stone-900 font-bold">₹{maxRent.toLocaleString()}</strong>
            </span>
            <input
              type="range"
              min="8000"
              max="35000"
              step="1000"
              value={maxRent}
              onChange={(e) => setMaxRent(Number(e.target.value))}
              className="w-40 sm:w-56 accent-violet-600 cursor-pointer"
            />
          </div>

          {/* Quick Amenity Chips */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
            <span className="text-stone-400 font-semibold shrink-0">Amenities:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'Air Conditioning', label: 'AC' },
              { id: 'Wi-Fi', label: 'Wi-Fi' },
              { id: 'Power Backup', label: 'Power Backup' },
              { id: 'Meals Included', label: 'Food Included' },
              { id: 'Gym', label: 'Gym' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedAmenity(chip.id)}
                className={`shrink-0 px-3 py-1 rounded-lg font-medium transition-colors border ${
                  selectedAmenity === chip.id
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {chip.label}
              </button>
            ))}

            {(cityFilter !== 'all' || localityQuery || typeFilter !== 'all' || maxRent < 35000 || selectedAmenity !== 'all') && (
              <button
                onClick={resetFilters}
                className="shrink-0 text-violet-700 hover:text-violet-900 text-xs font-bold underline ml-2"
              >
                Reset All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Property Cards Grid */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
            <Home className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">No accommodations match your filters</h3>
          <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
            Try adjusting your budget range, changing the locality or clearing amenity restrictions.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-5 py-2.5 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => {
            const isSaved = savedIds.includes(prop.id);
            const isComparing = compareList.some((c) => c.id === prop.id);
            const upfrontMoveInEstimate = prop.monthlyRent + prop.securityDeposit + prop.maintenanceCharges;

            return (
              <div
                key={prop.id}
                className="group bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* Image Cover & Badges */}
                <div className="relative h-52 bg-stone-100 overflow-hidden">
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/95 text-stone-900 shadow-sm backdrop-blur-xs">
                      {prop.roomType}
                    </span>
                    {prop.brokerageFee === 0 && (
                      <span className="px-2 py-1 rounded-md text-[10px] font-extrabold uppercase bg-emerald-600 text-white shadow-sm">
                        Zero Brokerage
                      </span>
                    )}
                  </div>

                  {/* Save Heart & Compare Buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleCompare(prop)}
                      title={isComparing ? 'Remove from compare' : 'Add to compare'}
                      className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                        isComparing
                          ? 'bg-violet-600 text-white'
                          : 'bg-white/85 hover:bg-white text-stone-700'
                      }`}
                    >
                      <Columns className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleSave(prop.id)}
                      title={isSaved ? 'Remove from saved' : 'Save property'}
                      className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                        isSaved
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/85 hover:bg-white text-stone-700'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Bottom info on image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {prop.locality}, {prop.city}
                    </span>
                    <span className="text-[11px] bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                      Available {prop.availableFrom}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <h3
                      onClick={() => onSelectProperty(prop)}
                      className="font-bold text-stone-900 text-base leading-snug line-clamp-1 hover:text-violet-700 cursor-pointer transition-colors"
                    >
                      {prop.title}
                    </h3>

                    {/* Lister Verification & Gender Badge */}
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-1.5 text-xs text-stone-600">
                        <img
                          src={prop.lister.avatar}
                          alt={prop.lister.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="truncate max-w-[110px] font-medium">{prop.lister.name}</span>
                        {prop.lister.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 fill-violet-50 shrink-0" />
                        )}
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          prop.genderEligibility === 'Female Only'
                            ? 'bg-rose-100 text-rose-700'
                            : prop.genderEligibility === 'Male Only'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {prop.genderEligibility}
                      </span>
                    </div>

                    {/* Transparent Rules Summary */}
                    <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <div>
                        <span className="text-stone-400 font-medium">Curfew:</span>{' '}
                        <span className="font-semibold text-stone-700">{prop.curfew}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 font-medium">Food:</span>{' '}
                        <span className="font-semibold text-stone-700 truncate block">{prop.foodRules}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 font-medium">Smoking:</span>{' '}
                        <span className="font-semibold text-stone-700">{prop.smokingRule}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 font-medium">Visitors:</span>{' '}
                        <span className="font-semibold text-stone-700 truncate block">{prop.visitorPolicy}</span>
                      </div>
                    </div>

                    {/* Key Amenities pills */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {prop.amenities.slice(0, 3).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md"
                        >
                          {amenity}
                        </span>
                      ))}
                      {prop.amenities.length > 3 && (
                        <span className="text-[10px] font-semibold text-violet-600 px-1 py-0.5">
                          +{prop.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Action */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-end justify-between">
                    <div>
                      <div className="text-[11px] text-stone-400 font-semibold uppercase">Monthly Rent</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-stone-900">
                          ₹{prop.monthlyRent.toLocaleString()}
                        </span>
                        <span className="text-xs text-stone-500 font-normal">/mo</span>
                      </div>
                      <div className="text-[10px] text-stone-500 font-medium mt-0.5">
                        Upfront Move-in: ~₹{upfrontMoveInEstimate.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectProperty(prop)}
                      className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                    >
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Comparison Tray (Offset above mobile bottom nav) */}
      {compareList.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900 text-white px-4 sm:px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom duration-200 border border-stone-700 max-w-[92vw]">
          <div className="flex items-center gap-2">
            <Columns className="w-4 h-4 text-violet-400 shrink-0" />
            <span className="text-xs font-bold truncate">
              {compareList.length} {compareList.length === 1 ? 'place' : 'places'} to compare
            </span>
          </div>
          <button
            onClick={onOpenCompareModal}
            className="px-3.5 py-1.5 bg-gradient-to-r from-violet-500 to-rose-500 hover:from-violet-600 hover:to-rose-600 text-white text-xs font-extrabold rounded-xl transition-all shrink-0"
          >
            Compare
          </button>
        </div>
      )}

      {/* Mobile Touch Filter Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-t border-stone-200 animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle & Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-violet-600" />
                <h3 className="font-extrabold text-stone-900 text-sm">Filter Accommodations</h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-lg bg-stone-200 text-stone-600"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">City</label>
                <div className="grid grid-cols-2 gap-2">
                  {['all', 'Bangalore', 'Mumbai', 'Delhi', 'Pune'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCityFilter(c)}
                      className={`py-2 px-3 rounded-xl font-bold border transition-colors ${
                        cityFilter === c
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      {c === 'all' ? 'All Cities' : c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Accommodation Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'All Types' },
                    { id: 'pg', label: 'Coliving / PG' },
                    { id: 'flat', label: 'Entire Flat' },
                    { id: 'private_room', label: 'Private Room' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTypeFilter(t.id)}
                      className={`py-2 px-3 rounded-xl font-bold border transition-colors ${
                        typeFilter === t.id
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-stone-700 uppercase mb-1">
                  <span>Max Monthly Rent</span>
                  <span className="text-violet-700 font-extrabold text-sm">₹{maxRent.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="8000"
                  max="35000"
                  step="1000"
                  value={maxRent}
                  onChange={(e) => setMaxRent(Number(e.target.value))}
                  className="w-full accent-violet-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Gender Restrictions</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'all', label: 'Any / Co-ed' },
                    { id: 'Female Only', label: 'Female Only' },
                    { id: 'Male Only', label: 'Male Only' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGenderFilter(g.id)}
                      className={`py-2 px-2 rounded-xl font-bold text-center border text-[11px] transition-colors ${
                        genderFilter === g.id
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Locality Search</label>
                <input
                  type="text"
                  value={localityQuery}
                  onChange={(e) => setLocalityQuery(e.target.value)}
                  placeholder="e.g. Koramangala, Powai"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            {/* Bottom Actions with safe-area padding */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 pb-safe flex gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-violet-600 text-white font-extrabold text-xs shadow-md"
              >
                Show {filteredProperties.length} Accommodations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
