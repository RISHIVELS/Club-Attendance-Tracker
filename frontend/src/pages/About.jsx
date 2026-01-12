import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-base-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
            About Club Hub
          </h1>
          <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
            Revolutionizing club event management with seamless attendance
            tracking and participant engagement.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Feature 1 */}
          <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="card-title text-lg justify-center">
                Attendance Tracking
              </h3>
              <p className="text-base-content/70">
                Effortlessly track participant attendance with QR code scanning
                and real-time monitoring.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="card-title text-lg justify-center">
                Participant Management
              </h3>
              <p className="text-base-content/70">
                Manage participant data, event registrations, and team
                information in one centralized platform.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="card-title text-lg justify-center">
                Analytics & Reports
              </h3>
              <p className="text-base-content/70">
                Generate detailed reports and analytics on event participation
                and attendance patterns.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-base-200 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-base-content text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Event Creation",
                description:
                  "Clubs create events with detailed information and registration forms",
              },
              {
                step: "02",
                title: "Team Registration",
                description:
                  "Participants register for events individually or as teams",
              },
              {
                step: "03",
                title: "QR Code Generation",
                description:
                  "Unique QR codes are generated for each participant/team",
              },
              {
                step: "04",
                title: "Attendance Tracking",
                description:
                  "Scan QR codes at events to mark attendance in real-time",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-content rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-base-content mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-base-content/70">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-neutral-900 -to-r from-primary to-secondary rounded-2xl p-8 text-center text-primary-content mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Club Management?
          </h2>
          <p className="text-xl opacity-90 mb-6 max-w-2xl mx-auto">
            Join hundreds of clubs already using Club Hub to streamline their
            event management and attendance tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events/register" className="btn btn-primary btn-lg">
              Create Your First Event
            </Link>
          </div>
        </div>

        {/* Creator Section */}
        <div className="text-center border-t border-base-300 pt-12">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-base-content mb-4">
              Created by Rishivel S
            </h3>
            <p className="text-base-content/70 mb-6">
              Club Hub was designed and developed to solve real-world challenges
              in club event management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
