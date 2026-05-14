import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { Gallery } from './pages/Gallery'
import { BottomNavPrototype } from './pages/BottomNavPrototype'
import { QuickEntryPrototype } from './pages/QuickEntryPrototype'
import { NavLayoutPrototype } from './pages/NavLayoutPrototype'
import { AccountSectionPrototype } from './pages/AccountSectionPrototype'
import { OnboardingPrototype } from './pages/OnboardingPrototype'
import { CalendarPagePrototype } from './pages/CalendarPagePrototype'
import { DailyBudgetCardPrototype } from './pages/DailyBudgetCardPrototype'
import { DailyBudgetCardPalettePrototype } from './pages/DailyBudgetCardPalettePrototype'
import { HomeV3Prototype } from './pages/HomeV3Prototype'
import { HomeV4Prototype } from './pages/HomeV4Prototype'
import { CategoryTopABPrototype } from './pages/CategoryTopABPrototype'
import { AssetOutlookABPrototype } from './pages/AssetOutlookABPrototype'
import { RecentRecordsABPrototype } from './pages/RecentRecordsABPrototype'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/bottom-nav" element={<BottomNavPrototype />} />
        <Route path="/quick-entry" element={<QuickEntryPrototype />} />
        <Route path="/nav-layout" element={<NavLayoutPrototype />} />
        <Route path="/account-section" element={<AccountSectionPrototype />} />
        <Route path="/onboarding" element={<OnboardingPrototype />} />
        <Route path="/calendar-page" element={<CalendarPagePrototype />} />
        <Route path="/daily-budget-card" element={<DailyBudgetCardPrototype />} />
        <Route path="/daily-budget-card-palette" element={<DailyBudgetCardPalettePrototype />} />
        <Route path="/home-v3" element={<HomeV3Prototype />} />
        <Route path="/home-v4" element={<HomeV4Prototype />} />
        <Route path="/category-ab" element={<CategoryTopABPrototype />} />
        <Route path="/asset-outlook-ab" element={<AssetOutlookABPrototype />} />
        <Route path="/recent-records-ab" element={<RecentRecordsABPrototype />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
