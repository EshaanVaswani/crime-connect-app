import { Ionicons } from "@expo/vector-icons";

declare global {
   type TabParamList = {
      index: undefined;
      report: undefined;
      profile: undefined;
      community: undefined;
   };

   type IconName = React.ComponentProps<typeof Ionicons>["name"];
}
