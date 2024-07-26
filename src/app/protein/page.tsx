import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Search, Database, Network, Box } from "lucide-react";

const DefaultRightPanel = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="p-8 max-w-3xl">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Welcome to the Protein Explorer
        </h2>
        <p className="mb-6 text-lg text-center text-gray-600">
          Discover, analyze, and visualize protein structures and relationships
          with ease.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <FeatureCard
            icon={<Search className="h-8 w-8 text-blue-500" />}
            title="Search"
            description="Find proteins by name, ID, or keywords using the left panel."
          />
          <FeatureCard
            icon={<Database className="h-8 w-8 text-green-500" />}
            title="Basic Info"
            description="View comprehensive details about each protein."
          />
          <FeatureCard
            icon={<Network className="h-8 w-8 text-purple-500" />}
            title="Relationship Graph"
            description="Explore connections between proteins visually."
          />
          <FeatureCard
            icon={<Box className="h-8 w-8 text-orange-500" />}
            title="3D Structure"
            description="Interact with 3D models of protein structures."
          />
        </div>
        <div className="text-center">
          <a
            href="#"
            className="inline-flex items-center group text-lg font-semibold text-black hover:text-gray-700 transition-colors"
          >
            <span className="bg-black text-white p-3 rounded-full mr-4 group-hover:bg-gray-800 transition-colors">
              <ArrowLeft className="h-8 w-8" />
            </span>
            <span className="relative">
              Start searching
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

// eslint-disable-next-line
const FeatureCard = ({ icon, title, description }) => (
  <Card>
    <CardContent className="flex flex-col items-center p-6">
      {icon}
      <h3 className="text-xl font-semibold mt-4 mb-2">{title}</h3>
      <p className="text-center text-gray-600">{description}</p>
    </CardContent>
  </Card>
);

export default DefaultRightPanel;
