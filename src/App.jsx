import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Loader from './components/Loader.jsx';
import Navbar from './components/Navbar.jsx';
import Background from './components/Background.jsx';
import Footer from './components/Footer.jsx';
import Hero from './sections/Hero.jsx';
import Problem from './sections/Problem.jsx';
import ShapeCalculator from './sections/ShapeCalculator/ShapeCalculator.jsx';
import OptimisationLab from './sections/OptimisationLab/OptimisationLab.jsx';
import DimensionCalculator from './sections/DimensionCalculator.jsx';
import Explanation from './sections/Explanation.jsx';
import Applications from './sections/Applications.jsx';
import Technology from './sections/Technology.jsx';
import About from './sections/About.jsx';

export default function App() {
  const [loading, setLoading] = useState(true);
  const done = useCallback(() => setLoading(false), []);

  return (
    <>
      <Background />
      <AnimatePresence>{loading && <Loader key="loader" onDone={done} />}</AnimatePresence>
      {!loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <Navbar />
          <main>
            <Hero />
            <Problem />
            <ShapeCalculator />
            <OptimisationLab />
            <DimensionCalculator />
            <Explanation />
            <Applications />
            <Technology />
            <About />
          </main>
          <Footer />
        </motion.div>
      )}
    </>
  );
}
