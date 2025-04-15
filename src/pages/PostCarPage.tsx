
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";

// Define the condition type to match the expected enum values
type CarCondition = "new" | "like_new" | "excellent" | "good" | "fair" | "poor";

const conditionOptions = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
] as const;

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  make: z.string().min(2, {
    message: "Make must be at least 2 characters.",
  }),
  model: z.string().min(2, {
    message: "Model must be at least 2 characters.",
  }),
  year: z.string().refine((value) => {
    const year = parseInt(value, 10);
    return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear();
  }, {
    message: "Year must be a valid number between 1900 and the current year.",
  }),
  price: z.string().refine((value) => {
    const price = parseInt(value, 10);
    return !isNaN(price) && price > 0;
  }, {
    message: "Price must be a valid number greater than 0.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  condition: z.enum(["new", "like_new", "excellent", "good", "fair", "poor"]),
  image: z.any().optional(),
});

const PostCarPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: carId } = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [existingCar, setExistingCar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (carId) {
      setIsEditing(true);
      fetchCarDetails(carId);
    } else {
      setIsEditing(false);
      setExistingCar(null);
    }
  }, [carId]);

  const fetchCarDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching car details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch car details. Please try again.",
        });
      } else {
        setExistingCar(data);
        setImageUrl(data.image_url || null);
        
        // Ensure the condition value is one of the allowed enum values
        const carCondition = data.condition as CarCondition;
        
        form.setValue("title", data.title);
        form.setValue("make", data.make);
        form.setValue("model", data.model);
        form.setValue("year", data.year.toString());
        form.setValue("price", data.price.toString());
        form.setValue("description", data.description);
        form.setValue("condition", carCondition);
      }
    } catch (error: any) {
      console.error("Error fetching car details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch car details. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      make: "",
      model: "",
      year: "",
      price: "",
      description: "",
      condition: "new" as CarCondition,
    },
    mode: "onChange",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to post a car.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      let uploadedImageUrl = imageUrl;

      if (values.image) {
        const imageFile = values.image instanceof File ? values.image : values.image[0];

        if (!imageFile) {
          console.warn("No image file selected.");
        } else {
          // Validate image type
          const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
          if (!allowedImageTypes.includes(imageFile.type)) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Invalid image format. Only JPEG, PNG, and GIF are allowed."
            });
            setIsSubmitting(false);
            return;
          }

          // Validate image size (max 5MB)
          if (imageFile.size > 5 * 1024 * 1024) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Image size exceeds the limit of 5MB."
            });
            setIsSubmitting(false);
            return;
          }

          const timestamp = new Date().getTime();
          const random = Math.floor(Math.random() * 1000);
          const uniqueFileName = `${timestamp}-${random}-${imageFile.name}`;

          const { data, error } = await supabase.storage
            .from('car-images')
            .upload(uniqueFileName, imageFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            console.error("Error uploading image:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to upload image. Please try again."
            });
            setIsSubmitting(false);
            return;
          }

          uploadedImageUrl = `https://pcyuwktvexjrzuiusilt.supabase.co/storage/v1/object/public/car-images/${data.path}`;
          setImageUrl(uploadedImageUrl);
        }
      }
      
      // Ensure the condition value is properly typed as CarCondition
      const condition = values.condition as CarCondition;
      
      // Prepare car data with proper types
      const carData = {
        title: values.title,
        make: values.make,
        model: values.model,
        year: parseInt(values.year),
        price: parseInt(values.price),
        description: values.description,
        condition: condition,
        user_id: user.id,
        image_url: uploadedImageUrl,
      };
      
      console.log("Submitting car data:", carData);
      
      let result;
      
      if (isEditing && carId) {
        // Update existing car
        result = await supabase
          .from('cars')
          .update(carData)
          .eq('id', carId)
          .eq('user_id', user.id);
      } else {
        // Insert new car
        result = await supabase
          .from('cars')
          .insert(carData);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      setIsSubmitting(false);
      form.reset();
      
      toast({
        title: "Success!",
        description: isEditing 
          ? "Your car listing has been updated successfully."
          : "Your car has been successfully posted for sale.",
      });
      
      // Wait a moment to ensure the data has been fully processed
      setTimeout(() => {
        // Redirect to homepage to see the new listing
        navigate("/");
      }, 500);
      
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setSubmitError(error.message || "An unexpected error occurred.");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to post car. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">
            {isEditing ? "Edit Car Listing" : "Post a Car for Sale"}
          </h1>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2015 Honda Civic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Honda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Civic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2015" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 15000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the car's condition, features, etc."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {conditionOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            form.setValue("image", file);
                          }}
                          id="image-upload"
                          className="hidden"
                        />
                      </FormControl>
                      <Button variant="outline" asChild>
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          {imageUrl ? "Change Image" : "Upload an Image"}
                          <ImageIcon className="h-4 w-4 ml-2" />
                        </Label>
                      </Button>
                      {imageUrl && (
                        <div className="mt-2">
                          <img
                            src={imageUrl}
                            alt="Car Preview"
                            className="max-h-40 rounded-md object-contain"
                          />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {submitError && (
                  <p className="text-red-500 text-sm">{submitError}</p>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Submitting..."
                  ) : isEditing ? (
                    "Update Listing"
                  ) : (
                    "Post Car"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PostCarPage;
