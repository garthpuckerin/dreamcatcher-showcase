import React, { lazy, Suspense } from 'react'
import FieldNotebookApp from './field-notebook/FieldNotebookApp'

const PublicCaseStudy = lazy(() => import('./field-notebook/views/PublicCaseStudy'))

const usePublicCaseStudy = (() => {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('case-study') === '1' || params.get('view') === 'case-study'
})()

export default function App() {
  if (usePublicCaseStudy) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-white flex items-center justify-center text-slate-600">
            Loading case study...
          </div>
        }
      >
        <PublicCaseStudy
          onOpenDemo={() => {
            window.location.href = '/'
          }}
        />
      </Suspense>
    )
  }

  return <FieldNotebookApp />
}
