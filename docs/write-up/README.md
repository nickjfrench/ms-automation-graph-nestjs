# Write Up of Implementation

This write up isn't a "code as we go" tutorial, instead I aim to explain how I've implemented the Microsoft Auth library and handled the OAuth flow, and bridge this current gap in knowledge.

## Pre-requisites

As this write-up aims to fill an specific knowledge gap, I won't be explaining in-depth concepts for NestJS, TypeScript/JS, Web Development, RESTful APIs, or other information that is readily available in documentation. 

So I suggest familiarizing yourself with those topics.

## 0. Azure Entra App Registration

This section is a requirement for this application to function.

This is needed to get the Azure secrets and IDs for user delegated authorization through Microsoft Identity Platform, allowing us to call MS Graph APIs.

### M365 Dev Environment

Sign up for the Microsoft 365 developer environment if you're eligible. You won't have access to Azure directly, but you'll still get access to Entra (Active Directory).

<https://learn.microsoft.com/en-us/office/developer-program/microsoft-365-developer-program-get-started>

Otherwise, use your Azure account, but beware of risks of developing in your production environment.

### App Registration with Microsoft Entra

Start a new App Registration.

Depending whether you're using Azure's Entra or M365 Entra (through Dev environment), the location of the app registration section is slightly different.

### Azure's Entra (Production Environment)

Navigate to [Microsoft Entra ID](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps) and find App Registration within side menu.

<img src="images/00-Entra/Azure-App-Registration.png" alt="Location of Azure App Registration Button" height="400"/>

### M365's Entra (Dev Environment)

Navigate to [Microsoft Entra admin center](https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade/quickStartType~/null/sourceType/Microsoft_AAD_IAM) and find App registration under Applications dropdown in side menu.

<img src="images/00-Entra/Entra-App-Registration.png" alt="Location of Entra App Registration Button" height="400"/>

### App Registration

The following steps to register an application are the same regardless of M365's Entra or Azure's Entra.

1. Start a new Registration.
1. Name the application, select the support account type that applies to you. For internal organization use, select the first option, this restricts login access to only this directory.
1. Enter the Redirect URI `{domain/localhost}/api/v1/auth/callback`. `http:/localhost:3000` for development, or use `HTTPS` and domain for production.

<img src="images/00-Entra/Register-an-Application.png" alt="Details of App Registration" height="400"/>

### App Certifications & Secrets

1. Within App Registration, navigate to Certifications & Secrets then new Client Secret.
1. Enter a name and expiry date.
1. Copy Client Secret, as this is the only time you'll see it.
1. Paste it within your secret management process, for `AZURE_CLIENT_SECRET`.
   See the Secrets section of project [Readme](../../README.md#-secrets).

<img src="images/00-Entra/Certificates-Secrets.png" alt="Certificates and Secrets Page" height="300"/>

### API Permissions - Scope

1. Within the API Permissions section, click Add Permission.
1. Choose Microsoft Graph, then Delegated Permissions.
1. Search and add for each Scope listed within [appConfig.json](../../appConfig.json) file. E.g. `User.Read` etc.
1. Back on the listed Configured Permissions, click Grant admin consent for MSFT.

<img src="images/00-Entra/API-Permissions.png" alt="API Permissions Page" height="250" />

<img src="images/00-Entra/Request-API-Permissions.png" alt="Request API Permission popup" height="600"/>

### Copy Tenant and Client ID

1. Navigate back to Overview page of app registration.
1. Copy the Application (client) ID and Directory (tenant) ID, and save into secrets management for `AZURE_CLIENT_ID` and `AZURE_TENANT_ID`.
   See the Secrets section of project [Readme](../../README.md#-secrets).

<img src="images/00-Entra/Copy-Client-Tenant-IDs.png" alt="Copy Client and Tenant IDs" height="300"/>

### Generate Secret Key for Session Management

Express-Session requires a secret key to be set. You can read more at the [Express-Session API Documentation](https://www.npmjs.com/package/express-session).

It's recommended to use at least a 32-byte random string (64 characters).

Save this secret within your secrets management for `SESSION_SECRET_KEY`.
See the Secrets section of project [Readme](../../README.md#-secrets).

### Environment Variables

After the above steps, you should have the following secrets and IDs saved in your method of choice for NestJS secret management. I'm using a `.env.development.local` file.

```env
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_ID=xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_SECRET=xxxxx~xxxxxxxxxxx~xxxxxxxxxxxxxxxxxxxxxx
AZURE_REDIRECT_URI=http://localhost:3000/api/v1/auth/callback

SESSION_SECRET_KEY={64 character random string as minimum}
```

## 1. Microsoft OAuth2 (MSAL) Flow and Test Graph Call

The following is an overview and explanation on how I implemented MSAL-Node to handle the OAuth2.0 flow and to access Microsoft Graph APIs.

### The OAuth2.0 Flow

Now we have Azure Entra app registration configured, we can use it to perform an OAuth2.0 flow.
There are plenty of guides on the internet explaining how OAuth2.0 works so I won't go into detail.

Microsoft calls this their Entra Identity Platform. You can start here: <https://learn.microsoft.com/en-us/entra/identity-platform/v2-app-types>

We're using the MSAL for NodeJS library for OAuth2.0 flow, as it abstracts a lot of the technical details required with an alternative method like Passport or manually requesting it in Express.

The basics for how it's implemented within this project are:

1. User navigates to a protected endpoint, e.g. /user.
1. An NestJS AuthGuard is used to check on the protected endpoint (e.g. /user) request. This checks the user's session for a token.
1. If no token, raise an UnauthorizedException, which is caught by a custom NestJS UnauthorizedException filter. This does the following:
   1. Save the original request url (/user) within session.
   1. Redirect the user to /auth/login, which redirects the user to Microsoft Authorization url. Passing in options within query parameters.
1. User logs in with their Microsoft work account.
1. As Entra knows our redirect URI, it sends the client back to that endpoint with the code appended (/auth/callback?code=xxxxx).
1. The Callback endpoint receives the redirection and uses the code to request an access token (handled by MSAL-Node library) from the Microsoft Token url.
1. The token is saved to the user's session and the original redirection URL is read from session.
1. User is then redirected to their original endpoint (/user).

### Session Management

`main.ts`

For simplicity, session management is handled by `express-session`, which stores the session in memory. Additional options can be provided to instead use another session store for more permanent sessions, like Redis.

NestJS documentation also advises against the default in-memory configuration of express-session within production, as "it will leak memory under most conditions, does not scale past a single process, and is meant for debugging and developing" [[source]](https://docs.nestjs.com/techniques/session)

The implementation of express-session can be found in [/src/main.ts](/src/main.ts). You can read more about the configuration settings used within the [NestJS Session](https://docs.nestjs.com/techniques/session) page and [Express-Session](https://github.com/expressjs/session) documentation.

```ts
// Session Management - This is not safe for Production.
app.use(
  session({
    // Generate a random session secret if not provided.
    secret:
      configService.get<string>('SESSION_SECRET_KEY') ||
      crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isSessionSecure,
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  }),
);
```

#### Extending Session's Type

`/src/types/session.d.ts`

To not upset TypeScript, I've extended the standard Session type to support the accessToken and the afterLoginRedirect.

```ts
import 'express-session';

declare module 'express-session' {
  export interface SessionData {
    token?: string;
    afterLoginRedirect?: string;
  }
}
```

#### Accessing Session Data

First ensure Request is imported from 'express' not another package.
You can access session data, by accessing the `req.session` object.
For example:

```ts
import { Request } from 'express';
export class AuthService {
  ... // Other Code

  async getAfterLoginRedirect(req: Request): Promise<string> {
    return req.session.afterLoginRedirect || '/';
  }
}
```

### Authentication Logic

#### AuthController

`src/auth/auth.controller`

As per MVC design, I've separated out most logic from Controllers and placed it in Services.

First the AuthService is injected within AuthController:

```ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
```

The Login route is pretty simple, just gets the Microsoft /authorize url from `authService.signIn` and redirects the user to that.

```ts
  @Get('login')
  async login(@Res() res: Response): Promise<void> {
    const loginUrl = await this.authService.signIn();
    res.redirect(loginUrl);
  }
```

The Logout route calls the `authService.signOut` function and awaits the asynchronous process to be completed.

If completed but the status was set to Bad_Request, the user had no token - which we're considering as user is already logged out.
Additional error checking performed incase session had issues destroying token.

```ts
  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.authService
      .signOut(req)
      .then((status) => {
        let message = 'Logged out successfully.';

        // If the user token wasn't found, we consider the user not logged in.
        if (status === HttpStatus.BAD_REQUEST) {
          message = 'User not logged in.';
        }

        res.status(status).send({ message: message });
      })
      .catch((error) => {
        const errMessage = 'Error logging out: ' + error.message;
        throw new InternalServerErrorException(errMessage);
      });
  }
```

The Callback route handles the redirection from the Microsoft Authorization flow. The user is redirected here with the code included as a query parameter after successfully logging into Microsoft.

We call the `AuthService.handleRedirect` which uses the code to perform the exchange for the token and store it in session. The User is then redirected back to their original route before login.

```ts
  @Get('callback')
  async callback(
    @Req() req: Request,
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.handleRedirect(req, code);

    // Get the original destination URL from the session or return '/'.
    const redirectUrl = await this.authService.getAfterLoginRedirect(req);

    // Delete AfterLoginRedirect from Session. Awaiting for Async process not required.
    this.authService.deleteAfterLoginRedirect(req);

    // Redirect user back to their original destination.
    res.redirect(redirectUrl);
  }
}
```

#### AuthService

`src/auth/auth.service`

AuthService handles the interaction with the MSAL-Node library, as well as session-management.

The AuthService constructor looks messy, but it's needed to avoid some TypeScript type errors.

1. First we declare `msalClient` as a ConfidentialClientApplication. This assumes the token handling is kept confidential, e.g. not within a client-side app. This doc explains more: <https://learn.microsoft.com/en-us/entra/identity-platform/msal-client-applications>
1. As we're using `ConfigService` for receiving environment variables, their types need to be explicitly set to avoid TypeScript errors. Any use of `infer: true` tells TypeScript to listen to the ConfigService types defined.
1. We can now configure the msalClient.
   1. clientID is read from envs.
   1. authority sets the tenant url for /authorize and /access endpoints used within the OAuth2.0 flow.
   1. clientSecret is used when requesting an access token from a code.
1. Then instantiate the msalClient with the above configuration.

```ts
@Injectable()
export class AuthService {
  // ConfidentialClientApplication is used for WebApp and WebAPI scenarios. See MSAL-Node docs for more info.
  private msalClient: ConfidentialClientApplication;

  constructor(
    // Setting ConfigService to infer environment variables types to prevent TypeScript errors.
    private configService: ConfigService<
      {
        AZURE_CLIENT_ID: string;
        AZURE_TENANT_ID: string;
        AZURE_CLIENT_SECRET: string;
        AZURE_REDIRECT_URI: string;
      },
      true
    >,
  ) {
    const msalConfig: Configuration = {
      auth: {
        clientId: this.configService.get<string>('AZURE_CLIENT_ID', {
          // Infer the type of the environment variable from the types set in constructor. Prevents TypeScript error.
          infer: true,
        }),
        authority: `https://login.microsoftonline.com/${this.configService.get<string>('AZURE_TENANT_ID')}`,
        clientSecret: this.configService.get<string>('AZURE_CLIENT_SECRET', {
          infer: true,
        }),
      },
    };
    this.msalClient = new ConfidentialClientApplication(msalConfig);
  }
```

The `signIn` function uses the `msalClient` to build the OAuth2.0 /authorize link that a user will be redirected to.

```ts
  async signIn(): Promise<string> {
    const authUrlParameters = {
      scopes: appConfig.AZURE_SCOPES,
      redirectUri: this.configService.get<string>('AZURE_REDIRECT_URI', {
        infer: true,
      }),
    };

    return await this.msalClient.getAuthCodeUrl(authUrlParameters);
  }
```

The `handleRedirect` function handles the redirection logic from Microsoft's authorization login.

1. First get the code from the parameter and use this to build out tokenRequest configuration for `msalClient`.
1. `msalClient` then performs the logic to call the OAuth2.0 /access endpoint exchanging the user's code with an access token.
1. Save the accessToken in session.
1. Log the account login attempt information received from OpenID Connect information.
   - **Note**: If you wanted to authenticate the user based using OpenID Connect, this is where you do so.

```ts
  async handleRedirect(
    req: Request,
    code: string,
  ): Promise<AuthenticationResult> {
    const tokenRequest = {
      code: code,
      scopes: appConfig.AZURE_SCOPES,
      redirectUri: this.configService.get<string>('AZURE_REDIRECT_URI', {
        infer: true,
      }),
    };

    // Code is received in the URL from Redirection URI. MSAL then handles the exchange of code for token.
    const response = await this.msalClient.acquireTokenByCode(tokenRequest);

    req.session.token = response.accessToken;

    // Log user sign in.
    if (response.account)
      console.log(response.account.username + ' sign in successful.');
    else console.log('Unknown User sign in successful.');

    return response;
  }
```

The `signOut` function is relatively simple, it just deletes the user's session (including accessToken). If you're using session to track additional information, you may need to alter this.

```ts
async signOut(req: Request): Promise<HttpStatus> {
    return new Promise((resolve, reject) => {
      // If no token, user is not signed in.
      if (!req.session.token) resolve(HttpStatus.BAD_REQUEST);

      // Destroy user session to "log out".
      req.session.destroy((err) => {
        if (err) {
          reject(new Error(err.message));
        }
      });

      resolve(HttpStatus.OK);
    });
  }
```

The last two functions in the `AuthService` get and delete the original URL that the user was trying to access.

```ts
  async getAfterLoginRedirect(req: Request): Promise<string> {
    return req.session.afterLoginRedirect || '/';
  }

  async deleteAfterLoginRedirect(req: Request): Promise<void> {
    delete req.session.afterLoginRedirect;
  }
}
```

#### AuthGuard

`/src/auth/auth.guard`

A Guard is a NestJS injectable, you can read more here: <https://docs.nestjs.com/guards>

They simply perform a check when called and return either true or false, telling the route if it should allow the request.

First we need to call this guard within the routes we would like to protect. As will be seen later in the User route. Here's a snippet:

```ts
  @Get()
  @UseGuards(AuthGuard)
  async getUserProfile(
    ...
  )
```

This can also be done at the controller level (every route under that controller) or globally, you can read more about that on the NestJS Docs.

When a guard is called, we just read the session to see if a token exists. By default returning false raises ForbiddenException under the hood, which we're not actually sure that's true yet, so instead we throw an UnauthorizedException and handle that logic elsewhere.

```ts
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.session?.token) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
```

#### UnauthorizedException Filter

`/src/filters/unauthorized-exception/unauthorized-exception.filter`

An Exception Filter is another NestJS feature, you can read more here: <https://docs.nestjs.com/exception-filters>

Basically any Exception that isn't handled within code (e.g. a try catch statement) will be caught by this layer.

The implementation within this project, uses this feature to catch the UnauthorizedException raised by AuthGuard and start the the user to login process.

First `afterLoginRedirect` is captured from the request and sent to `validateRedirectHostname` function to validate the request comes from the same hostname as the request. Preventing redirection type malicious attacks.

If the request is bad (aka attempts to redirect to another hostname), we throw another exception.

If the redirection is safe, we save the url in the session (to be read later by the `/auth/callback` route), and redirect the user to /auth/login to start the authorization flow _(as described earlier in this write-up)_.

```ts
@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(_exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const afterLoginRedirect = request.url;

    // Validate the redirect URL before storing it in the session.
    if (!this.validateRedirectHostname(afterLoginRedirect, request)) {
      console.error(
        '400 Bad Request: Invalid request hostname: ' + request.hostname,
      );
      throw new BadRequestException(
        'Invalid request hostname: ' + request.hostname,
      );
    }

    // At this point the url is considered safe, so we can proceed.
    request.session.afterLoginRedirect = afterLoginRedirect;

    // Log the user login attempt.
    console.error(
      '401 Unauthorized: User not logged in, redirecting to login.',
    );

    // Redirect to start authorization flow.
    response.redirect('auth/login');
  }

  // Ensure redirect URL is on the same site as the request. Prevent redirects to malicious site.
  private validateRedirectHostname(
    afterLoginRedirectUrl: string,
    req: Request,
  ): boolean {
    const url = new URL(afterLoginRedirectUrl, `http://${req.headers.host}`);

    if (url.hostname !== req.hostname) {
      return false;
    }

    return true;
  }
}
```

To activate the Exception Filters you must pass them to the app on bootstrap (within main.ts):

```ts
  ... // Other bootstrap code

  const filters: ExceptionFilter<any>[] = [
    new UnauthorizedExceptionFilter(),
  ];

  filters.forEach((filter) => app.useGlobalFilters(filter));
```

### Getting User Profile with MS Graph API

#### UserController

`/src/user/user.controller`

Like the AuthController, we need to inject the UserService.

```ts
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  ... // User Route
```

As mentioned within AuthGuard, we need to set the use of AuthGuard within the @UseGuards decorator.

If we enter the body of this route, then we know the User passed AuthGuard tests.
So we can pass the token to the `userService.getUserProfile` function, guaranteed this will exist.

After receiving the response from the Service, return the user profile to the user.

```ts
  ... // Constructor

  @Get()
  @UseGuards(AuthGuard)
  async getUserProfile(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const response = await this.userService.getUserProfile(
        req.session.token!,
      );
      res.status(HttpStatus.OK).send(response.data);
    } catch (error) {
      const errMessage = 'Error getting user profile: ' + error.message;
      throw new InternalServerErrorException(errMessage);
    }
  }
}
```

#### UserService

`/src/user/user.service`

The getUserProfile function of the UserService handles the call to the relevant MS Graph API.
This is done via the axios Node package, which is just used to call the API endpoint.

We received the accessToken from the controller, now it needs to be set as a Bearer token within the header. We call then call Graph /me api. Which is used to fetch the current User's Profile.

This is returned the Controller.

```ts
@Injectable()
export class UserService {
  constructor() {}

  async getUserProfile(accessToken: string): Promise<AxiosResponse> {
    const url = appConfig.GRAPH_API_ROOT_URL + '/me';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    return axios.get(url, { headers });
  }
}
```

## Conclusion

That's it, hopefully you gained useful knowledge from this write-up.

I may continue to update this repo as I find better ways of doing the above, but I will not be expanding the scope above what it is currently.

If you find any bugs/issues or have suggestions for either the code or this write-up, please raise an [Issue](https://github.com/nickjfrench/ms-graph-msal-nestjs/issues) and I would be happy to chat further. After all, the purpose of this project is to learn, and that includes from community.
