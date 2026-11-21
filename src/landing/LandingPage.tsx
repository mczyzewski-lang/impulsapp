import { Hero, LandingNav } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { ForCreators, ForRecipients } from "./Audiences";
import { EmailVsImpuls } from "./EmailVsImpuls";
import { ChannelPreview } from "./ChannelPreview";
import { UnlockChat } from "./UnlockChat";
import { Faq, FinalCta, Footer, UseCases } from "./Closing";

export default function LandingPage() {
  return (
    <div className="bg-white">
      <LandingNav />
      <main>
        <Hero />
        <HowItWorks />
        <ForCreators />
        <EmailVsImpuls />
        <ForRecipients />
        <ChannelPreview />
        <UnlockChat />
        <UseCases />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
