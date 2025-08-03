import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BlogPostProps {
  title: string;
  summary: string;
  link: string;
  imageUrl: string;
  date: string;
}

export const BlogPost = ({ title, summary, link, imageUrl, date }: BlogPostProps) => {
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