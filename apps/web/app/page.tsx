import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeatureGrid } from './components/FeatureGrid';
import { Footer } from './components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <Hero />
      <FeatureGrid />
      <Footer />
    </main>
  );
}
