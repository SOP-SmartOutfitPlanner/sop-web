import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginFormValues, RegisterFormValues } from "@/lib/types/auth";

interface FieldProps {
  control: Control<LoginFormValues | RegisterFormValues>;
}

export const EmailField = ({ control }: FieldProps) => (
  <FormField
    control={control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input placeholder="name@example.com" type="email" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const PasswordField = ({ control }: FieldProps) => (
  <FormField
    control={control}
    name="password"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Mật khẩu</FormLabel>
        <FormControl>
          <Input type="password" placeholder="••••••" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const NameField = ({ control }: FieldProps) => (
  <FormField
    control={control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Tên</FormLabel>
        <FormControl>
          <Input placeholder="John Doe" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
