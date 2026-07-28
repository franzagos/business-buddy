import {
  Landmark,
  Users,
  Handshake,
  Snowflake,
  MessageCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps the `icon` string on a coach's RubricDimension (src/lib/coaches/*\/rubric.ts)
 * to its lucide-react component. Add here whenever a rubric introduces a new icon id.
 */
const RUBRIC_ICON_MAP: Record<string, LucideIcon> = {
  landmark: Landmark,
  users: Users,
  handshake: Handshake,
  snowflake: Snowflake,
  "message-circle": MessageCircle,
  sparkles: Sparkles,
};

export function RubricIcon({
  icon,
  className,
}: {
  icon: string | undefined;
  className?: string;
}) {
  const Icon = (icon && RUBRIC_ICON_MAP[icon]) || Sparkles;
  return <Icon className={className} />;
}
