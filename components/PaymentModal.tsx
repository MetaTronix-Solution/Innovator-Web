"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, CheckCircle2, Lock } from "lucide-react";
import { ResearchPaper } from "@/types/research";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: ResearchPaper;
  onConfirm: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  paper,
  onConfirm,
}: PaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-600" />
            Secure Checkout
          </DialogTitle>
          <DialogDescription>
            Unlock <strong>{paper.title}</strong> for NPR {paper.price}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Payment Method</Label>
            <div className="flex items-center gap-3 p-4 border-2 border-purple-600 rounded-xl bg-purple-50 dark:bg-purple-950/20 cursor-pointer">
              <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                K
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Khalti Wallet
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Fast & Secure (Recommended)
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg text-[11px] text-muted-foreground text-center border border-dashed">
            You will be redirected to the secure Khalti gateway to complete your
            payment.
          </div>

          <Button
            onClick={onConfirm}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-lg"
          >
            Pay NPR {paper.price} with Khalti
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ReceiptModal({ isOpen, onClose, paper }: any) {
  const txnId = `KH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-emerald-600" />
        </div>
        <DialogTitle className="text-xl">Payment Successful!</DialogTitle>
        <div className="bg-muted p-4 rounded-xl space-y-3 text-sm my-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ref ID:</span>
            <span className="font-mono font-medium">{txnId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-semibold">NPR {paper?.price}</span>
          </div>
        </div>
        <Button
          onClick={onClose}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          Access Paper
        </Button>
      </DialogContent>
    </Dialog>
  );
}
