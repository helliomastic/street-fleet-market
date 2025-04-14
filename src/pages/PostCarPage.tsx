
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
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
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from 'uuid';

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
  condition: z.string().min(1, {
    message: "Condition is required.",
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

// Condition options
const CONDITIONS = ["New", "Like New", "Excellent", "Good", "Fair", "Poor"];

const PostCarPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
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
      condition: "Good",
    },
  });

  // Check if user is authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You need to log in to post or edit car listings.",
      });
      navigate("/auth?tab=login");
    }
  }, [user, isLoading, navigate, toast]);

  // Fetch car data if in edit mode
  useEffect(() => {
    const fetchCarData = async () => {
      if (id && user) {
        setIsEditMode(true);
        setIsLoading(true);
        
        try {
          const { data, error } = await supabase
            .from('cars')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();
            
          if (error) {
            throw error;
          }
          
          if (data) {
            // Populate form with existing data
            form.setValue('title', data.title);
            form.setValue('make', data.make);
            setSelectedMake(data.make);
            form.setValue('model', data.model);
            form.setValue('year', data.year.toString());
            form.setValue('price', data.price.toString());
            form.setValue('description', data.description);
            form.setValue('condition', data.condition);
            
            // Set image preview if available
            if (data.image_url) {
              setPreviewUrl(data.image_url);
            }
          }
        } catch (error) {
          console.error('Error fetching car data:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load car data. Please try again.",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchCarData();
  }, [id, user, form, toast]);

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
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You need to log in to post or edit car listings.",
      });
      navigate("/auth?tab=login");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Upload image to Supabase Storage if there's a new image
      let imageUrl = previewUrl;
      if (image) {
        // Create a unique filename
        const fileExt = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        // Check if 'cars' bucket exists, if not create it
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.find(b => b.name === 'car-images')) {
          await supabase.storage.createBucket('car-images', {
            public: true,
            fileSizeLimit: 5242880 // 5MB
          });
        }
        
        // Upload the file
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('car-images')
          .upload(filePath, image);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('car-images')
          .getPublicUrl(filePath);
          
        imageUrl = urlData.publicUrl;
      }
      
      // Prepare car data
      const carData = {
        title: values.title,
        make: values.make,
        model: values.model,
        year: parseInt(values.year),
        price: parseInt(values.price),
        description: values.description,
        condition: values.condition,
        user_id: user.id,
        image_url: imageUrl,
      };
      
      let result;
      
      if (isEditMode) {
        // Update existing car
        result = await supabase
          .from('cars')
          .update(carData)
          .eq('id', id)
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
      
      // Show success message
      toast({
        title: isEditMode ? "Car listing updated!" : "Car listing created!",
        description: isEditMode 
          ? "Your car has been successfully updated."
          : "Your car has been successfully posted for sale.",
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creating/updating listing:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "There was a problem with your listing. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            {isEditMode ? "Edit Your Car Listing" : "Post a Car for Sale"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isEditMode 
              ? "Update the details of your car listing below."
              : "Fill out the form below to list your car on Street Fleet Market."}
          </p>

          {isLoading && !form.formState.isSubmitting ? (
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          ) : (
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

                {/* Basic Info: Make, Model, Year, Condition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONDITIONS.map((condition) => (
                              <SelectItem key={condition} value={condition}>
                                {condition}
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
                  <Button 
                    type="submit" 
                    className="bg-brand-orange hover:bg-opacity-90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Saving..."
                    ) : isEditMode ? (
                      "Save Changes"
                    ) : (
                      "Post Car for Sale"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PostCarPage;
