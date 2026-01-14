'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { DateRangePicker } from '@/components/DateRangePicker'
import { fetchWithAuth } from '@/lib/api'

interface Question {
  span_id: string
  start_time: string
  user_email: string
  brand_id: string
  question: string
  answer: string
  generation_type: string
  token_count_total: number
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [brandId, setBrandId] = useState('')
  const [genType, setGenType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (brandId) params.append('brand_id', brandId)
      if (genType) params.append('generation_type', genType)
      // Note: Backend currently supports limit/offset/brand/type. 
      // Date filtering would ideally be on backend, but for now we filter client side or just show recent.
      // If backend adds date support to /questions, we can pass it.
      
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/phoenix/questions?${params}`)
      if (res.ok) {
        const data = await res.json()
        setQuestions(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [brandId, genType])

  const openDetails = async (spanId: string) => {
    // We can fetch details or just use the data we have if it's complete.
    // The list endpoint returns full objects for now, so we can just find it.
    const q = questions.find(q => q.span_id === spanId)
    if (q) setSelectedQuestion(q)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Questions Analysis
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand ID</label>
              <input
                type="text"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                placeholder="Filter by Brand ID"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Generation Type</label>
              <input
                type="text"
                value={genType}
                onChange={(e) => setGenType(e.target.value)}
                placeholder="Filter by Type"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
               {/* Placeholder for Date Range if backend supported it fully, 
                   for now visual only or we can implement client-side filter if needed */}
               <label className="block text-sm font-medium text-gray-700 mb-1">Date Range (Visual)</label>
               <DateRangePicker 
                 startDate={startDate} 
                 endDate={endDate} 
                 onStartDateChange={setStartDate} 
                 onEndDateChange={setEndDate} 
               />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User / Brand
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tokens
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((q) => (
                    <tr key={q.span_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(q.start_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">{q.user_email || 'N/A'}</div>
                        <div className="text-gray-500 text-xs">{q.brand_id || 'No Brand'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {q.generation_type || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {q.question || 'No question text'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {q.token_count_total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openDetails(q.span_id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedQuestion(null)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Question Details
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Question</h4>
                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedQuestion.question}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Answer</h4>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded whitespace-pre-wrap max-h-96 overflow-y-auto">
                          {selectedQuestion.answer}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Metadata</h4>
                          <ul className="mt-1 text-sm text-gray-500">
                            <li>User: {selectedQuestion.user_email}</li>
                            <li>Brand: {selectedQuestion.brand_id}</li>
                            <li>Type: {selectedQuestion.generation_type}</li>
                            <li>Time: {new Date(selectedQuestion.start_time).toLocaleString()}</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Metrics</h4>
                          <ul className="mt-1 text-sm text-gray-500">
                            <li>Total Tokens: {selectedQuestion.token_count_total}</li>
                            <li>Span ID: {selectedQuestion.span_id}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedQuestion(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
