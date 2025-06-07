
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CarListing } from "./CarListing";

interface CarEditFormProps {
  editingCar: CarListing;
  setEditingCar: (car: CarListing | null) => void;
  updating: boolean;
  updateError: string | null;
  handleUpdateCar: (id: string) => Promise<void>;
}

export const CarEditForm = ({ 
  editingCar, 
  setEditingCar, 
  updating, 
  updateError, 
  handleUpdateCar 
}: CarEditFormProps) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Edit Car Listing</CardTitle>
        <CardDescription>
          Edit the details of the selected car listing.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="title"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Title
            </label>
            <Input
              id="title"
              value={editingCar.title}
              onChange={(e) =>
                setEditingCar({ ...editingCar, title: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="make"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Make
            </label>
            <Input
              id="make"
              value={editingCar.make}
              onChange={(e) =>
                setEditingCar({ ...editingCar, make: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="model"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Model
            </label>
            <Input
              id="model"
              value={editingCar.model}
              onChange={(e) =>
                setEditingCar({ ...editingCar, model: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="year"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Year
            </label>
            <Input
              id="year"
              type="number"
              value={editingCar.year}
              onChange={(e) =>
                setEditingCar({
                  ...editingCar,
                  year: parseInt(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label
              htmlFor="price"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Price
            </label>
            <Input
              id="price"
              type="number"
              value={editingCar.price}
              onChange={(e) =>
                setEditingCar({
                  ...editingCar,
                  price: parseInt(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label
              htmlFor="condition"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Condition
            </label>
            <Select
              value={editingCar.condition}
              onValueChange={(value) =>
                setEditingCar({ ...editingCar, condition: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="like_new">Like New</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="fuel_type"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Fuel Type
            </label>
            <Select
              value={editingCar.fuel_type}
              onValueChange={(value) =>
                setEditingCar({ ...editingCar, fuel_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="petrol">Petrol</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label
            htmlFor="description"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
          >
            Description
          </label>
          <Textarea
            id="description"
            placeholder="Car Description"
            value={editingCar.description}
            onChange={(e) =>
              setEditingCar({ ...editingCar, description: e.target.value })
            }
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setEditingCar(null)}>
          Cancel
        </Button>
        <Button onClick={() => handleUpdateCar(editingCar.id)} disabled={updating}>
          {updating ? "Updating..." : "Update Car"}
        </Button>
        {updateError && (
          <p className="text-red-500 text-sm mt-1">{updateError}</p>
        )}
      </CardFooter>
    </Card>
  );
};
