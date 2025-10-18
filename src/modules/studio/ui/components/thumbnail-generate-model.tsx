"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import type { AppRouter } from "@/trpc/routers/_app";
import type { TRPCClientError } from "@trpc/client";

const formSchema = z.object({
    prompt: z.string().min(10, { message: "Prompt must be at least 10 characters." }),
});

interface ThumbnailGenerateModelProps {
    videoId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ThumbnailGenerateModel = ({
    videoId,
    open,
    onOpenChange,
}: ThumbnailGenerateModelProps) => {
    const utils = trpc.useUtils();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { prompt: "" },
    });

    const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
        onSuccess: () => {
            toast.success("AI job for thumbnail started!");
            utils.studio.getOne.invalidate({ id: videoId });
            onOpenChange(false);
            form.reset();
        },
        onError: (err) => toast.error(err.message),
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        generateThumbnail.mutate({ videoId: videoId, prompt: values.prompt });
    };

    return (
        <ResponsiveDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Generate Thumbnail with AI"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prompt</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g., A cinematic shot of a futuristic city at sunset"
                                        className="resize-none"
                                        rows={5}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={generateThumbnail.isPending}>
                            {generateThumbnail.isPending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
                            Generate
                        </Button>
                    </div>
                </form>
            </Form>
        </ResponsiveDialog>
    );
};