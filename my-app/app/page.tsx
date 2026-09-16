import { MengToSketchbookLandingPage } from "../components/effects/meng-to-sketchbook-landing-page";

export default function Home() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <MengToSketchbookLandingPage
        headingFont="instrument-serif"
        bodyFont="newsreader"
        headingWeight="400"
        bodyWeight="400"
        primaryColor="#2b2721"
        headingSize={30}
        bodySize={20}
        headingLetterSpacing={0.01}
      />
    </div>
  );
}
