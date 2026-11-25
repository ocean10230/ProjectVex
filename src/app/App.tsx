import { Toaster } from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { HashRouter, Route, Routes } from 'react-router-dom'

import Header from 'components/layout/Header'
import PageWrapper from 'components/layout/TransitionWrapper'

import Pages from './PageExports'

import ModalRenderer from 'hooks/utilities/Modal'
import ThemeHandlers from 'hooks/themes/Hooks'
import DownloadHandlers from 'hooks/downloads/DownloadHooks'
import ValidateApiKey from './validation/ApiValidator'

const MappedRoutes = [
  {
    path: "/",
    element: Pages.Main
  },
  {
    path: "/history",
    element: Pages.DownloadHistory
  },
  {
    path: "/download",
    element: Pages.VideoDownloading
  }
]

export function App() {
  ThemeHandlers()
  DownloadHandlers()
  ValidateApiKey()
  
  return (
    <AnimatePresence>
      <motion.div
        className="right-0 bg-bg text-text relative rounded-lg flex flex-col w-140 h-115 position:relative border-border border overflow-hidden"
      >
        <ModalRenderer />
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

              <Route path="/settings/*" element={<PageWrapper key="danhbeo"><Pages.Settings/></PageWrapper>}>
                <Route path="download" element={<PageWrapper key="download"><Pages.DownloadSetting/></PageWrapper>} />
                <Route path="appearance" element={<PageWrapper key="appearance"><Pages.Appearance/></PageWrapper>} />
                <Route path="preference" element={<PageWrapper key="preferences"><Pages.Preference/></PageWrapper>} />
                <Route path="about" element={<PageWrapper key="about"><Pages.About/></PageWrapper>} />
              </Route>
            </Routes>
          </HashRouter>
        </AnimatePresence>
        
        
      </motion.div>
    </AnimatePresence>
  )
}