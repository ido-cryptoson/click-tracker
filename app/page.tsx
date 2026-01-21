'use client'

import { useState, useEffect } from 'react'

interface Link {
  id: string
  slug: string
  original_url: string
  created_at: string
  click_count: number
}

interface Stats {
  link: Link
  totalClicks: number
  countryStats: Record<string, number>
  browserStats: Record<string, number>
  deviceStats: Record<string, number>
  clicksOverTime: Record<string, number>
}

export default function Dashboard() {
  const [url, setUrl] = useState('')
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStats, setSelectedStats] = useState<Stats | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links')
      const data = await res.json()
      if (Array.isArray(data)) {
        setLinks(data)
      } else {
        setLinks([])
      }
    } catch {
      setLinks([])
    }
  }

  const createLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    if (res.ok) {
      setUrl('')
      fetchLinks()
    }
    setLoading(false)
  }

  const viewStats = async (slug: string) => {
    const res = await fetch(`/api/stats/${slug}`)
    const data = await res.json()
    setSelectedStats(data)
  }

  const copyToClipboard = (slug: string) => {
    navigator.clipboard.writeText(`${baseUrl}/go/${slug}`)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Click Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Create trackable links and monitor clicks
        </p>

        {/* Create Link Form */}
        <form onSubmit={createLink} className="mb-8">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL to track (e.g., https://example.com)"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Link'}
            </button>
          </div>
        </form>

        {/* Links Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Tracked Link
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Original URL
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                  Clicks
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {links.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No links yet. Create your first tracked link above.
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <code className="text-sm text-blue-600 dark:text-blue-400">
                        /go/{link.slug}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {link.original_url}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {link.click_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(link.slug)}
                        className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded"
                      >
                        {copied === link.slug ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={() => viewStats(link.slug)}
                        className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded"
                      >
                        Stats
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Stats Modal */}
        {selectedStats && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Link Statistics
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      /go/{selectedStats.link.slug}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedStats(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="text-center mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedStats.totalClicks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Countries</h3>
                    {Object.entries(selectedStats.countryStats).length === 0 ? (
                      <p className="text-sm text-gray-500">No data</p>
                    ) : (
                      <ul className="space-y-1">
                        {Object.entries(selectedStats.countryStats).map(([country, count]) => (
                          <li key={country} className="text-sm flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">{country}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Browsers</h3>
                    {Object.entries(selectedStats.browserStats).length === 0 ? (
                      <p className="text-sm text-gray-500">No data</p>
                    ) : (
                      <ul className="space-y-1">
                        {Object.entries(selectedStats.browserStats).map(([browser, count]) => (
                          <li key={browser} className="text-sm flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">{browser}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Devices</h3>
                    {Object.entries(selectedStats.deviceStats).length === 0 ? (
                      <p className="text-sm text-gray-500">No data</p>
                    ) : (
                      <ul className="space-y-1">
                        {Object.entries(selectedStats.deviceStats).map(([device, count]) => (
                          <li key={device} className="text-sm flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">{device}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Original URL:</strong>{' '}
                  <a href={selectedStats.link.original_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    {selectedStats.link.original_url}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
