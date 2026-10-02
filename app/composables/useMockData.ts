export interface FlockRecord {
  id: number
  name: string
  house: string
  ageDays: number
  birdCount: number
  mortalityRate: number
  status: 'healthy' | 'warning' | 'critical'
}

export const useMockData = () => {
  const monthlyRevenue = [
    { label: 'Jan', value: 118 },
    { label: 'Feb', value: 142 },
    { label: 'Mar', value: 135 },
    { label: 'Apr', value: 148 },
    { label: 'May', value: 178 },
    { label: 'Jun', value: 132 },
    { label: 'Jul', value: 121 },
    { label: 'Aug', value: 145 },
    { label: 'Sep', value: 128 },
    { label: 'Oct', value: 98 },
    { label: 'Nov', value: 104 },
    { label: 'Dec', value: 112 },
  ]

  const feedConsumption = [
    { label: 'Week 1', value: 2400 },
    { label: 'Week 2', value: 2650 },
    { label: 'Week 3', value: 2980 },
    { label: 'Week 4', value: 3120 },
    { label: 'Week 5', value: 3400 },
    { label: 'Week 6', value: 3210 },
  ]

  const productionMix = [
    { label: 'Broiler Sales', value: 492, color: '#3b6ef6' },
    { label: 'Live Bird Sales', value: 1730, color: '#f5b700' },
    { label: 'Processed', value: 320, color: '#22c55e' },
    { label: 'Export', value: 180, color: '#8b6cf2' },
  ]

  const flocks: FlockRecord[] = [
    { id: 1, name: 'Batch A-114', house: 'House 1 · Sector A', ageDays: 28, birdCount: 12400, mortalityRate: 1.8, status: 'healthy' },
    { id: 2, name: 'Batch A-115', house: 'House 2 · Sector A', ageDays: 21, birdCount: 11800, mortalityRate: 2.4, status: 'healthy' },
    { id: 3, name: 'Batch B-208', house: 'House 3 · Sector B', ageDays: 35, birdCount: 10200, mortalityRate: 4.9, status: 'warning' },
    { id: 4, name: 'Batch B-209', house: 'House 4 · Sector B', ageDays: 14, birdCount: 12900, mortalityRate: 7.2, status: 'critical' },
    { id: 5, name: 'Batch C-301', house: 'House 5 · Sector C', ageDays: 7, birdCount: 13100, mortalityRate: 0.6, status: 'healthy' },
    { id: 6, name: 'Batch C-302', house: 'House 6 · Sector C', ageDays: 42, birdCount: 9800, mortalityRate: 3.1, status: 'healthy' },
  ]

  const orders = [
    { id: 'ORD-7231', customer: 'Greenfield Distributors', date: '2026-09-24', birds: 4200, amount: 18900, status: 'Delivered' },
    { id: 'ORD-7232', customer: 'Metro Fresh Foods', date: '2026-09-25', birds: 2800, amount: 12600, status: 'Processing' },
    { id: 'ORD-7233', customer: 'Coastal Poultry Co.', date: '2026-09-26', birds: 6100, amount: 27450, status: 'Delivered' },
    { id: 'ORD-7234', customer: 'Sunrise Market Chain', date: '2026-09-27', birds: 3400, amount: 15300, status: 'Pending' },
    { id: 'ORD-7235', customer: 'Valley Fresh Retail', date: '2026-09-27', birds: 5200, amount: 23400, status: 'Delivered' },
    { id: 'ORD-7236', customer: 'Northgate Wholesale', date: '2026-09-28', birds: 1900, amount: 8550, status: 'Cancelled' },
    { id: 'ORD-7237', customer: 'Prime Cuts Ltd.', date: '2026-09-28', birds: 4800, amount: 21600, status: 'Processing' },
  ]

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  const today = new Date()
  const heatmapData = Array.from({ length: 84 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (83 - i))
    return {
      date: date.toISOString().slice(0, 10),
      value: Math.floor(seededRandom(i + 1) * 100),
    }
  })

  return {
    monthlyRevenue,
    feedConsumption,
    productionMix,
    flocks,
    orders,
    heatmapData,
  }
}
