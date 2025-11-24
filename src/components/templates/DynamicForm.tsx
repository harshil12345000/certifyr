import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface DynamicFormProps {
  config: any;
  initialData: any;
  onSubmit: (data: any) => void;
}

export function DynamicForm({ config, initialData, onSubmit }: DynamicFormProps) {
  const formSchema = generateZodSchema(config);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const renderField = (field: any, formControl: any) => {
    const watchedValues = form.watch();
    
    const label = field.dynamicLabel 
      ? field.dynamicLabel(watchedValues)
      : field.label;

    switch (field.type) {
      case "text":
        return (
          <FormField
            control={formControl}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input {...formField} placeholder={field.placeholder} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "date":
        return (
          <FormField
            control={formControl}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input type="date" {...formField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "select":
        return (
          <FormField
            control={formControl}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <Select value={formField.value} onValueChange={formField.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options.map((option: any) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "textarea":
        return (
          <FormField
            control={formControl}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Textarea {...formField} placeholder={field.placeholder} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "switch":
        return (
          <FormField
            control={formControl}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{label}</FormLabel>
                  {field.description && (
                    <FormDescription className="text-sm text-muted-foreground">
                      {field.description}
                    </FormDescription>
                  )}
                </div>
                <FormControl>
                  <Switch
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {config.sections.map((section: any) => (
          <div key={section.id} className="space-y-2">
            <h3 className="text-lg font-medium">{section.title}</h3>
            <div className={`grid grid-cols-1 ${section.columns === 2 ? 'md:grid-cols-2' : ''} gap-4`}>
              {section.fields.map((field: any) => (
                <div key={field.name} className={field.gridColumn ? `col-span-1` : ''}>
                  {renderField(field, form.control)}
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button type="submit" className="w-full">
          Update Preview
        </Button>
      </form>
    </Form>
  );
}

function generateZodSchema(config: any) {
  const schemaFields: any = {};
  
  config.sections.forEach((section: any) => {
    section.fields.forEach((field: any) => {
      let fieldSchema: any;
      
      switch (field.type) {
        case "text":
        case "textarea":
          fieldSchema = z.string();
          if (field.required) {
            if (field.validation?.minLength) {
              fieldSchema = fieldSchema.min(field.validation.minLength, {
                message: field.validation.message
              });
            }
          }
          break;
        case "date":
          fieldSchema = z.string().min(1, { message: `${field.label} is required` });
          break;
        case "select":
          const values = field.options.map((o: any) => o.value);
          fieldSchema = z.enum(values as [string, ...string[]]);
          break;
        case "switch":
          fieldSchema = z.boolean().default(field.defaultValue || false);
          break;
        default:
          fieldSchema = z.string();
      }
      
      schemaFields[field.name] = fieldSchema;
    });
  });
  
  return z.object(schemaFields);
}
