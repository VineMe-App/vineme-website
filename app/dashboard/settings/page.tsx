import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <section className="px-5 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage how VineMe connects to the tools your church already uses.
        </p>

        <Card className="mt-8">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-2xl">Link to ChurchSuite</CardTitle>
              <Badge variant="warning" size="lg">
                Not connected
              </Badge>
            </div>
            <CardDescription>
              Add your ChurchSuite API details so VineMe can sync people,
              groups, and follow-up status.
            </CardDescription>
          </CardHeader>
          <CardPanel>
            <Form className="space-y-5">
              <Field>
                <FieldLabel>ChurchSuite API key</FieldLabel>
                <Input
                  name="churchsuite-api-key"
                  type="password"
                  placeholder="Paste API key"
                />
                <FieldDescription>
                  Stored securely and only used to sync with ChurchSuite.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>ChurchSuite site URL</FieldLabel>
                <Input
                  name="churchsuite-site"
                  type="url"
                  placeholder="https://yourchurch.churchsuite.com"
                />
              </Field>

              <Button type="button" size="xl">
                Link to ChurchSuite
              </Button>
            </Form>
          </CardPanel>
          <CardFooter className="text-muted-foreground text-sm">
            API credentials are not submitted in this preview.
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
