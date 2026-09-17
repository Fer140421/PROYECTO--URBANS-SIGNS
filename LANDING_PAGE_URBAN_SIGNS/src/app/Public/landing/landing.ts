import { Component } from '@angular/core';
import { HeaderLanding } from "../../Core/Layout/landing-page/header-landing/header-landing";
import { FooterLanding } from "../../Core/Layout/landing-page/footer-landing/footer-landing";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-landing',
  imports: [HeaderLanding, FooterLanding, RouterOutlet],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {

}
