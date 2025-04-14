
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/layout/Layout";
import { AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Car form schema
const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  make: z.string().min(1, {
    message: "Please select a make.",
  }),
  model: z.string().min(1, {
    message: "Model is required.",
  }),
  year: z.string().min(4, {
    message: "Please select a valid year.",
  }),
  price: z.string().min(1, {
    message: "Price is required.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
});

// Mock data for makes and models
const MAKES = [
  "Audi", "BMW", "Chevrolet", "Dodge", "Ford", "Honda", "Hyundai", 
  "Jeep", "Kia", "Lexus", "Mazda", "Mercedes-Benz", "Nissan", "Tesla", "Toyota", "Volkswagen"
];

const MODELS_BY_MAKE: Record<string, string[]> = {
  "Audi": ["A3", "A4", "A6", "Q3", "Q5", "Q7"],
  "BMW": ["3 Series", "5 Series", "X3", "X5", "7 Series"],
  "Chevrolet": ["Silverado", "Equinox", "Malibu", "Tahoe", "Suburban"],
  "Dodge": ["Charger", "Challenger", "Durango", "Ram"],
  "Ford": ["F-150", "Escape", "Explorer", "Mustang", "Bronco"],
  "Honda": ["Civic", "Accord", "CR-V", "Pilot", "Odyssey"],
  "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade"],
  "Jeep": ["Wrangler", "Cherokee", "Grand Cherokee", "Compass", "Gladiator"],
  "Kia": ["Forte", "Optima", "Sportage", "Sorento", "Telluride"],
  "Lexus": ["IS", "ES", "RX", "NX", "GX"],
  "Mazda": ["Mazda3", "Mazda6", "CX-5", "CX-9", "MX-5"],
  "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE", "S-Class"],
  "Nissan": ["Altima", "Maxima", "Rogue", "Pathfinder", "Frontier"],
  "Tesla": ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
  "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma"],
  "Volkswagen": ["Jetta", "Passat", "Tiguan", "Atlas", "Golf"]
};

// Generate years from 1990 to current year
const YEARS = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => (1990 + i).toString());

const PostCarPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      make: "",
      model: "",
      year: new Date().getFullYear().toString(),
      price: "",
      description: "",
    },
  });

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // In a real app, this would upload the image to Supabase Storage
      // and save the listing data to Supabase Database
      console.log("Form values:", values);
      console.log("Image:", image);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast({
        title: "Car listing created!",
        description: "Your car has been successfully posted for sale.",
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem creating your listing. Please try again.",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Post a Car for Sale</h1>
          <p className="text-muted-foreground mb-8">
            Fill out the form below to list your car on Street Fleet Market.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2020 Toyota Camry - Low Miles" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive title helps your listing stand out.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Basic Info: Make, Model, Year */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedMake(value);
                          // Reset model when make changes
                          form.setValue("model", "");
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select make" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MAKES.map((make) => (
                            <SelectItem key={make} value={make}>
                              {make}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!selectedMake}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedMake ? "Select model" : "Select make first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedMake && 
                            MODELS_BY_MAKE[selectedMake]?.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
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
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {YEARS.reverse().map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (USD)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder="e.g. 15000" 
                          className="pl-7" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter your asking price in US dollars. No commas or decimal points.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your car's condition, features, history, etc."
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Include details about condition, features, maintenance history, and reason for selling.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <div className="space-y-3">
                <FormLabel>Car Images</FormLabel>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img 
                        src={previewUrl} 
                        alt="Car preview" 
                        className="mx-auto max-h-60 object-contain" 
                      />
                      <Button type="button" variant="outline" onClick={() => {
                        setImage(null);
                        setPreviewUrl(null);
                      }}>
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-lg font-medium">Drag and drop or click to upload</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          JPG, PNG or WEBP (max. 5MB)
                        </p>
                      </div>
                      <Input
                        id="car-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("car-image")?.click()}
                      >
                        Select Image
                      </Button>
                    </div>
                  )}
                </div>
                <FormDescription>
                  A good quality photo increases your chances of selling quickly.
                </FormDescription>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  By posting your car, you agree to our terms of service and confirm that all 
                  information provided is accurate and truthful.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-orange hover:bg-opacity-90">
                  Post Car for Sale
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default PostCarPage;
