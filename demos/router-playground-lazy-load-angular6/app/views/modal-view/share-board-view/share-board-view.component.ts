
// Import the core angular services.
import { ActivatedRoute } from "@angular/router";
import { Component } from "@angular/core";
import { delay } from "rxjs/operators";
import { OnDestroy } from "@angular/core";
import { OnInit } from "@angular/core";
import { ParamMap } from "@angular/router";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

// Import the application components and services.
import { ErrorLogger } from "~/app/shared/services/error-logger";
import { KeyboardShortcuts } from "~/app/shared/services/keyboard-shortcuts";
import { PartialService } from "./services/partial.service";
import { Unlisten } from "~/app/shared/services/keyboard-shortcuts";

// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //

interface Board {
	id: number;
	name: string;
}

@Component({
	selector: "share-board-view",
	host: {
		"(directclick)": "closeModal()"
	},
	styleUrls: [ "./share-board-view.component.less" ],
	templateUrl: "./share-board-view.component.htm"
})
export class ShareBoardViewComponent implements OnInit, OnDestroy {

	public board: Board;
	public isLoading: boolean;
	public shareUrl: string;

	private activatedRoute: ActivatedRoute;
	private errorLogger: ErrorLogger;
	private keyboardShortcuts: KeyboardShortcuts;
	private paramMapSubscription: Subscription;
	private partialService: PartialService;
	private router: Router;
	private unlisten: Unlisten;

	// I initialize the share-board-view component.
	constructor(
		activatedRoute: ActivatedRoute,
		errorLogger: ErrorLogger,
		keyboardShortcuts: KeyboardShortcuts,
		partialService: PartialService,
		router: Router
		) {
		
		this.activatedRoute = activatedRoute;
		this.errorLogger = errorLogger;
		this.keyboardShortcuts = keyboardShortcuts;
		this.partialService = partialService;
		this.router = router;

		this.board = null;
		this.isLoading = true;
		this.shareUrl = "https://invis.io/boards/Ze8jD3k77c";
		this.unlisten = null;

	}

	// ---
	// PUBLIC METHODS.
	// ---

	// I close the modal window.
	public closeModal() : void {

		this.router.navigate(
			[
				"/app",
				{
					outlets: {
						modal: null
					}
				}
			]
		);
		
	}


	public ngOnDestroy() : void {

		( this.paramMapSubscription ) && this.paramMapSubscription.unsubscribe();
		( this.unlisten ) && this.unlisten();

	}


	public ngOnInit() : void {

		this.paramMapSubscription = this.activatedRoute.paramMap
			// TIMING HACK: We need to add a tick-delay between the root ParamMap emit
			// and the callback in order to fix several Angular bugs.
			.pipe( delay( 10 ) )
			.subscribe(
				( paramMap : ParamMap ) : void => {

					this.loadData( +paramMap.get( "id" ) );
					
				}
			)
		;

		this.unlisten = this.keyboardShortcuts.listen(
			{
				"Escape": ( event: KeyboardEvent ) : void => {

					this.closeModal();

				}
			},
			{
				priority: this.keyboardShortcuts.getPriority( "modal" ),
				inputs: true
			}
		);

	}

	// ---
	// PRIVATE METHODS.
	// ---

	private loadData( boardID: number ) : void {

		this.isLoading = true;
		this.partialService
			.get( boardID )
			.then(
				( partial ) : void => {

					this.board = partial.board;
					this.isLoading = false;

				},
				( error: any ) : void => {

					this.errorLogger.log( error );
					this.router.navigate(
						[
							"/app",
							{
								outlets: {
									modal: "modal/error/could-not-load-board"
								}
							}
						]
					);

				}
			)
		;

	}

}