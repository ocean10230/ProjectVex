import { useEffect } from 'preact/hooks'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Check } from 'lucide-react'

import Header from 'components/layout/Header'
import PageWrapper from 'components/layout/TransitionWrapper'
import Notify from 'components/Notify'

import { Main } from 'pages/Main'
import { Settings } from 'pages/SettingsDisplayingPage'
import { DownloadSetting } from 'pages/settings/Download'
import { Appearance } from 'pages/settings/Appearance'
import { DownloadHistory } from 'pages/DownloadHistory'
import { About } from 'pages/settings/Information'
import { VideoDownloading } from 'pages/VideoDownload'
import { Preference } from 'pages/settings/Preferences'

import { VideoData, YoutubeURL } from 'hooks/utilities/VideoData'
import ThemeContext from 'hooks/themes/Display'

import useFetchVideoInfo from 'functions/FetchVideoInfo'

const MappedRoutes = [
  {
    path: "/",
    element: Main
  },
  {
    path: "/history",
    element: DownloadHistory
  },
  {
    path: "/download",
    element: VideoDownloading
  }
]

export function App() {
  const URL = YoutubeURL()
  const Data = VideoData()
  useFetchVideoInfo()

  const Theme = ThemeContext()

  useEffect(() => {
    window.postMessage({ type: "Context.Position", Position: Theme.Position })
  }, [Theme.Position])

  useEffect(() => document.body.setAttribute("color", Theme.Color), [Theme.Color])
  useEffect(() => document.body.setAttribute("theme", Theme.Theme), [Theme.Theme])
  useEffect(() => {
    const list = document.body.classList
    if (Theme.Compacted) list.add("compact")
    else list.remove("compact")
  }, [Theme.Compacted])


  useEffect(() => {
    const noUrl = import.meta.env.MODE === "development"
    if (noUrl) URL.setURL("https://www.youtube.com/watch?v=2c12kPi-v10")
  }, [])

  useEffect(() => {
    if (Data.pyodide_loaded) Notify("Loaded Python runtime", Check)
  }, [Data.pyodide_loaded])
  
  return (
    <AnimatePresence>
      <motion.div
        className="right-0 bg-bg text-text relative rounded-lg flex flex-col w-140 h-115 position:relative border-border border overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <HashRouter>
            <Toaster 
              position="bottom-right"
              containerStyle={{
                position: 'absolute',
                bottom: 6,
                right: 7,
                zIndex: 100,
                pointerEvents: 'none'
              }}
            />

            <Header />

            <Routes>
              {MappedRoutes.map((e) => <Route path={e.path} element={<PageWrapper key={e.path}><e.element/></PageWrapper>} />)}

              <Route path="/settings/*" element={<PageWrapper key="danhbeo"><Settings/></PageWrapper>}>
                <Route path="download" element={<PageWrapper key="download"><DownloadSetting/></PageWrapper>} />
                <Route path="appearance" element={<PageWrapper key="appearance"><Appearance/></PageWrapper>} />
                <Route path="preference" element={<PageWrapper key="preferences"><Preference/></PageWrapper>} />
                <Route path="about" element={<PageWrapper key="about"><About/></PageWrapper>} />
              </Route>
            </Routes>
          </HashRouter>
        </AnimatePresence>
        
        
      </motion.div>
    </AnimatePresence>
  )
}