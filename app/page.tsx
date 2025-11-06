'use client'

import { useState } from 'react'
import { Upload, Image, Video, Sparkles, Share2, Loader2 } from 'lucide-react'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [contentType, setContentType] = useState<'image' | 'video'>('image')
  const [platforms, setPlatforms] = useState({
    twitter: false,
    facebook: false,
    instagram: false,
    linkedin: false,
    youtube: false,
    tiktok: false,
  })
  const [loading, setLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [uploadResults, setUploadResults] = useState<any>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setGeneratedContent(null)
    setUploadResults(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, contentType }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedContent(data.url)
      } else {
        alert('Generation failed: ' + data.error)
      }
    } catch (error) {
      alert('Error generating content: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!generatedContent) return

    const selectedPlatforms = Object.entries(platforms)
      .filter(([_, enabled]) => enabled)
      .map(([platform]) => platform)

    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentUrl: generatedContent,
          platforms: selectedPlatforms,
          contentType,
          caption: prompt,
        }),
      })

      const data = await response.json()
      setUploadResults(data)
    } catch (error) {
      alert('Error uploading content: ' + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">AI Social Media Agent</h1>
          </div>
          <p className="text-gray-600 mb-8">Generate stunning AI images and videos, then upload to all your social platforms in one click</p>

          {/* Content Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Content Type</label>
            <div className="flex gap-4">
              <button
                onClick={() => setContentType('image')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  contentType === 'image'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Image className="w-5 h-5" />
                Image
              </button>
              <button
                onClick={() => setContentType('video')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  contentType === 'video'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Video className="w-5 h-5" />
                Video
              </button>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Describe Your Content</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A serene sunset over mountains with vibrant colors..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none text-gray-800"
              rows={4}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && !generatedContent ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate {contentType === 'image' ? 'Image' : 'Video'}
              </>
            )}
          </button>
        </div>

        {/* Generated Content Preview */}
        {generatedContent && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Generated Content</h2>
            <div className="mb-6 rounded-xl overflow-hidden bg-gray-100">
              {contentType === 'image' ? (
                <img src={generatedContent} alt="Generated" className="w-full" />
              ) : (
                <video src={generatedContent} controls className="w-full" />
              )}
            </div>

            {/* Platform Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select Platforms</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(platforms).map(([platform, enabled]) => (
                  <button
                    key={platform}
                    onClick={() => setPlatforms({ ...platforms, [platform]: !enabled })}
                    className={`px-4 py-3 rounded-xl font-medium capitalize transition-all ${
                      enabled
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={loading || Object.values(platforms).every((v) => !v)}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && generatedContent ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5" />
                  Upload to Selected Platforms
                </>
              )}
            </button>
          </div>
        )}

        {/* Upload Results */}
        {uploadResults && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Results</h2>
            <div className="space-y-3">
              {uploadResults.results?.map((result: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl ${
                    result.success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize text-gray-800">{result.platform}</span>
                    <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? '✓ Success' : '✗ Failed'}
                    </span>
                  </div>
                  {result.message && (
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
