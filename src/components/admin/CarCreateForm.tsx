
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
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

interface CarCreateFormProps {
  creating: boolean;
  createError: string | null;
  handleCreateCar: (userId: string, newCar: any) => Promise<void>;
}

export const CarCreateForm = ({ 
  creating, 
  createError, 
  handleCreateCar
}: CarCreateFormProps) => {
  const { user } = useAuth();

  const [newCar, setNewCar] = useState({
    title: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    condition: 'used',
    description: ''
  });

  const resetCarForm = () => {
    setNewCar({
      title: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      condition: 'used',
      description: ''
    });
  };

  const handleSubmit = () => {
    handleCreateCar(user?.id || '', newCar);
    resetCarForm();
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Create New Car Listing</CardTitle>
        <CardDescription>
          Create a new car listing to be displayed on the site.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="new-title"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Title
            </label>
            <Input
              id="new-title"
              value={newCar.title}
              onChange={(e) =>
                setNewCar({ ...newCar, title: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="new-make"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Make
            </label>
            <Input
              id="new-make"
              value={newCar.make}
              onChange={(e) =>
                setNewCar({ ...newCar, make: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="new-model"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Model
            </label>
            <Input
              id="new-model"
              value={newCar.model}
              onChange={(e) =>
                setNewCar({ ...newCar, model: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="new-year"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Year
            </label>
            <Input
              id="new-year"
              type="number"
              value={newCar.year}
              onChange={(e) =>
                setNewCar({
                  ...newCar,
                  year: parseInt(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label
              htmlFor="new-price"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Price
            </label>
            <Input
              id="new-price"
              type="number"
              value={newCar.price}
              onChange={(e) =>
                setNewCar({
                  ...newCar,
                  price: parseInt(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label
              htmlFor="new-condition"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Condition
            </label>
            <Input
              id="new-condition"
              value={newCar.condition}
              onChange={(e) =>
                setNewCar({ ...newCar, condition: e.target.value })
              }
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="new-description"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
          >
            Description
          </label>
          <Textarea
            id="new-description"
            placeholder="Car Description"
            value={newCar.description}
            onChange={(e) =>
              setNewCar({ ...newCar, description: e.target.value })
            }
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={resetCarForm}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={creating}>
          {creating ? "Creating..." : "Create Car"}
        </Button>
        {createError && (
          <p className="text-red-500 text-sm mt-1">{createError}</p>
        )}
      </CardFooter>
    </Card>
  );
};
