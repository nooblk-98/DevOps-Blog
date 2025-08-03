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
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {summary}
          </p>
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