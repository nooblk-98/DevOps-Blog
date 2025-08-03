import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogPost } from "@/components/BlogPost";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const posts = [
    {
      title: "Getting Started with Docker",
      description: "A beginner's guide to containerizing your applications with Docker.",
      link: "/tutorials/getting-started-with-docker",
    },
    {
      title: "CI/CD with GitHub Actions",
      description: "Learn how to automate your development workflow with GitHub Actions.",
      link: "/tutorials/ci-cd-with-github-actions",
    },
    {
      title: "Infrastructure as Code with Terraform",
      description: "Manage your infrastructure with code using Terraform.",
      link: "/tutorials/iac-with-terraform",
    },
  ];

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-6 md:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Welcome to DevOps Zone
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
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