import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Category {
  name: string;
}

interface BlogPostProps {
  title: string;
  summary: string;
  link: string;
  imageUrl: string;
  date: string;
  categories: Category[];
}

export const BlogPost = ({ title, summary, link, imageUrl, date, categories }: BlogPostProps) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="overflow-hidden flex flex-col">
      <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      <div className="flex flex-col flex-grow">
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            {categories.map((cat, index) => (
              <Badge key={index} variant="secondary">{cat.name}</Badge>
            ))}
          </div>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="relative">
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-4">
              {summary}
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-card to-transparent pointer-events-none" />
          </div>
        </CardContent>
        <CardFooter>
          <Link to={link}>
            <Button>Read More</Button>
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
};