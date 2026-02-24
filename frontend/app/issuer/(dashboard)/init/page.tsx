"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Key, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function IssuerInitPage() {
    const [loading, setLoading] = useState(false);
    const [issuerName, setIssuerName] = useState("");
    const [issuerType, setIssuerType] = useState("hospital");
    const router = useRouter();
    const { toast } = useToast();

    const handleInit = async () => {
        if (!issuerName) {
            toast({
                title: "Error",
                description: "Please enter an issuer name.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            // API call would go here
            // await api.issuer.init({ issuer_name: issuerName, issuer_type: issuerType });

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            toast({
                title: "Success",
                description: "Issuer keys generated successfully.",
                variant: "default",
                // using default or success if configured in toaster
            });

            router.push("/issuer");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to initialize issuer.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-2xl font-primary">
            <h1 className="text-3xl font-bold mb-8">Initialize Issuer Keys</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Generate Cryptographic Keys</CardTitle>
                    <CardDescription>
                        This will generate a BBS+ keypair for your organization. The public key will be published,
                        and the private key will be securely stored.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="issuer-name">Issuer Name</Label>
                        <Input
                            id="issuer-name"
                            placeholder="e.g. Apollo Hospital Mumbai"
                            value={issuerName}
                            onChange={(e) => setIssuerName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="issuer-type">Issuer Type</Label>
                        <Select value={issuerType} onValueChange={setIssuerType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hospital">Hospital / Healthcare Provider</SelectItem>
                                <SelectItem value="government">Government Agency (UIDAI, etc.)</SelectItem>
                                <SelectItem value="bank">Financial Institution</SelectItem>
                                <SelectItem value="education">University / School</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-sm text-blue-800 flex gap-3">
                        <Key className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <strong>Security Note:</strong> Your private key is encrypted before storage.
                            Only authorized personnel can use it to sign credentials.
                        </div>
                    </div>

                    <Button className="w-full bg-privaseal-blue hover:bg-privaseal-blue-dark" onClick={handleInit} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        Generate Keys & Initialize
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
