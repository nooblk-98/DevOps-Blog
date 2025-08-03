import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BlogPostProps {
  title: string;
  description: string;
  link: string;
}

export const BlogPost = ({ title, description, link }: BlogPostProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
      <CardFooter>
        <Link to={link}>
          <Button>Read More</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};