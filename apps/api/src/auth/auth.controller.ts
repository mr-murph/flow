import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard("local")) // We will create a local strategy later
  @Post("login")
  async login(@Request() req: Request) {
    // Aggiungi 'as any' per zittire l'errore TypeScript
    return this.authService.login((req as any).user);
  }
}
