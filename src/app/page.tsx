import { Hero } from "@/components/Hero";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Database, Search, Info } from "lucide-react";

export default function HomePage() {
  const featuredProteins = [
    {
      name: "Hemoglobin",
      description: "Oxygen-carrying protein in red blood cells",
      id: "9606.ENSP00000252242",
      icon: "🔴",
    },
    {
      name: "Collagen",
      description: "Structural protein in connective tissues",
      id: "9606.ENSP00000225964",
      icon: "🦴",
    },
    {
      name: "Actin",
      description: "Protein involved in muscle contraction and cell movement",
      id: "9606.ENSP00000055335",
      icon: "💪",
    },
    {
      name: "Myosin",
      description: "Motor protein essential for muscle contraction",
      id: "9606.ENSP00000348349",
      icon: "🏋️",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-primary/10">
      <Hero />

      <main className="container mx-auto px-4 py-12">
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">
            Explore the World of Proteins
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <Database className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Comprehensive Database
              </h3>
              <p className="text-gray-600">
                Access detailed information on thousands of proteins
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <Search className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Advanced Search</h3>
              <p className="text-gray-600">
                Find proteins by name, function, or structure
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <Info className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Detailed Insights</h3>
              <p className="text-gray-600">
                Get in-depth analysis and visualizations for each protein
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">
            Featured Proteins
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredProteins.map((protein, index) => (
              <Card
                key={index}
                className="flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <CardHeader className="flex flex-row items-center gap-4 bg-primary/5 p-4">
                  <span
                    className="text-4xl"
                    role="img"
                    aria-label={protein.name}
                  >
                    {protein.icon}
                  </span>
                  <h3 className="text-xl font-semibold text-primary">
                    {protein.name}
                  </h3>
                </CardHeader>
                <CardContent className="flex-grow p-4">
                  <p className="text-gray-600">{protein.description}</p>
                </CardContent>
                <CardFooter className="bg-primary/5 p-4">
                  <Button asChild className="w-full group">
                    <Link
                      href={`/protein/${protein.id}`}
                      className="flex items-center justify-center"
                    >
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-primary">
            Ready to Dive Deeper?
          </h2>
          <p className="mb-6 text-gray-600">
            Explore our full database of proteins and discover the building
            blocks of life.
          </p>
          <Button asChild size="lg">
            <Link href="/protein">Explore Full Database</Link>
          </Button>
        </section>
      </main>

      <footer className="bg-primary/5 text-primary/60 mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">
            &copy; 2024 Protein Explorer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
