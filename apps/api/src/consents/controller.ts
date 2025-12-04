import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { ConsentsService } from "./service";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard("jwt"))
@Controller("consents")
export class ConsentsController {
  constructor(private readonly consentsService: ConsentsService) {}

  @Post("templates")
  createTemplate(@Body() body: { title: string; content: string }) {
    return this.consentsService.createTemplate(body.title, body.content);
  }

  @Get("templates")
  getTemplates() {
    return this.consentsService.getTemplates();
  }

  @Post("generate")
  generateConsent(@Body() body: { patientId: string; templateId: string }) {
    return this.consentsService.generateConsent(body.patientId, body.templateId);
  }
}
