import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BlogPostProps {
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  date: string; // Added date prop
}

export const BlogPost = ({ title, description, link, imageUrl, date }: BlogPostProps) => {
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
          <p className="text-sm text-muted-foreground">{formattedDate}</p> {/* Displaying the date */}
        </CardHeader>
        <CardContent className="flex-grow">
          <div 
            className="text-gray-600 dark:text-gray-400 text-sm overflow-hidden max-h-24 relative prose dark:prose-invert max-w-none"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
            }}
            dangerouslySetInnerHTML={{ __html: description }} 
          />
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