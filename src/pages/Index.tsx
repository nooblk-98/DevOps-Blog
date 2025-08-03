import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogPost } from "@/components/BlogPost";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const posts = [
    {
      title: "Getting Started with Docker",
      description: "A beginner's guide to containerizing your applications with Docker.",
      link: "/tutorials/getting-started-with-docker",
      imageUrl: "https://images.unsplash.com/photo-1620325867582-51a294372d69?q=80&w=2070&auto=format&fit=crop",
      category: "Containers",
    },
    {
      title: "CI/CD with GitHub Actions",
      description: "Learn how to automate your development workflow with GitHub Actions.",
      link: "/tutorials/ci-cd-with-github-actions",
      imageUrl: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=2088&auto=format&fit=crop",
      category: "CI/CD",
    },
    {
      title: "Infrastructure as Code with Terraform",
      description: "Manage your infrastructure with code using Terraform.",
      link: "/tutorials/iac-with-terraform",
      imageUrl: "https://images.unsplash.com/photo-1590956994848-9a1a2a03a2b1?q=80&w=1974&auto=format&fit=crop",
      category: "IaC",
    },
    {
      title: "Kubernetes Basics",
      description: "An introduction to orchestrating containers with Kubernetes.",
      link: "/tutorials/kubernetes-basics",
      imageUrl: "https://images.unsplash.com/photo-1511537190424-bb287ac821e2?q=80&w=2070&auto=format&fit=crop",
      category: "Containers",
    },
    {
      title: "Monitoring with Prometheus & Grafana",
      description: "Set up a powerful monitoring stack for your applications.",
      link: "/tutorials/monitoring-prometheus-grafana",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
      category: "Monitoring",
    },
  ];

  const categories = ["All", ...Array.from(new Set(posts.map((post) => post.category)))];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = posts
    .filter((post) => {
      if (selectedCategory === "All") return true;
      return post.category === selectedCategory;
    })
    .filter(
      (post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <section
          className="relative py-20 md:py-32 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative container mx-auto px-6 md:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Welcome to DevOps Zone
              </h1>
              <p className="mt-4 text-lg text-gray-200">
                Your one-stop destination for DevOps tutorials and best practices.
              </p>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-20 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-6 md:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Latest Tutorials
              </h2>
              <div className="mt-6 flex justify-center flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <Input
                  type="text"
                  placeholder="Search tutorials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-lg w-full"
                />
              </div>
            </div>
            {filteredPosts.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post, index) => (
                  <BlogPost
                    key={index}
                    title={post.title}
                    description={post.description}
                    link={post.link}
                    imageUrl={post.imageUrl}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400">
                No tutorials found matching your search.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;