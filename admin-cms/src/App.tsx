// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Root FireCMS app (self-hosted, FireCMS v3 / @firecms/core).
//
// Auth: email/password only. Add admin users in the Firebase
// Console → Authentication → Users tab (Email/Password provider).
// Optionally restrict access further with ALLOWED_EMAILS below.
// ============================================================

import {
    AppBar,
    CircularProgressCenter,
    Drawer,
    FireCMS,
    ModeControllerProvider,
    NavigationRoutes,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationController,
    useValidateAuthenticator
} from "@firecms/core";
import {
    FirebaseAuthController,
    FirebaseLoginView,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useFirestoreDelegate,
    useInitialiseFirebase
} from "@firecms/firebase";

import { firebaseConfig } from "./firebaseConfig";
import { collections } from "./collections";

// Leave empty to allow any user that exists in Firebase Auth.
// Add specific emails to restrict admin access to just those accounts.
const ALLOWED_EMAILS: string[] = [
    // "owner@enzopizza.hu",
];

export default function App() {
    const modeController = useBuildModeController();

    const { firebaseApp, firebaseConfigLoading, configError } = useInitialiseFirebase({
        firebaseConfig
    });

    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions: ["password"]
    });

    const firestoreDelegate = useFirestoreDelegate({ firebaseApp: firebaseApp! });

    // Required by the <FireCMS> component's props, but never actually
    // invoked: no collection field below uses a `storage:` config, so
    // nothing ever calls Firebase Storage. You do NOT need to enable
    // Storage in the Firebase Console for this app to work — image
    // fields use plain URL text inputs instead (see collections/).
    const storageSource = useFirebaseStorageSource({ firebaseApp: firebaseApp! });

    const navigationController = useBuildNavigationController({
        collections,
        authController,
        dataSourceDelegate: firestoreDelegate
    });

    const configPersistence = useBuildLocalConfigurationPersistence();

    const { authLoading, canAccessMainView, notAllowedError } = useValidateAuthenticator({
        authController,
        authenticator: async ({ user }) => {
            if (ALLOWED_EMAILS.length === 0) return true;
            if (!user?.email || !ALLOWED_EMAILS.includes(user.email)) {
                throw Error("Ehhez a fiókhoz nincs admin jogosultság.");
            }
            return true;
        },
        dataSourceDelegate: firestoreDelegate
    });

    if (firebaseConfigLoading || !firebaseApp) {
        return <CircularProgressCenter />;
    }

    if (configError) {
        return <div style={{ padding: 24 }}>{configError}</div>;
    }

    return (
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>
                <FireCMS
                    navigationController={navigationController}
                    authController={authController}
                    userConfigPersistence={configPersistence}
                    dataSourceDelegate={firestoreDelegate}
                    storageSource={storageSource}
                >
                    {({ context, loading }) => {
                        if (loading || authLoading) {
                            return <CircularProgressCenter />;
                        }

                        if (!canAccessMainView) {
                            return (
                                <FirebaseLoginView
                                    authController={authController}
                                    firebaseApp={firebaseApp}
                                    signInOptions={["password"]}
                                    notAllowedError={notAllowedError}
                                    logo="/admin-logo.svg"
                                />
                            );
                        }

                        return (
                            <Scaffold autoOpenDrawer={false}>
                                <AppBar title="Enzopizza — Admin" />
                                <Drawer />
                                <NavigationRoutes />
                                <SideDialogs />
                            </Scaffold>
                        );
                    }}
                </FireCMS>
            </ModeControllerProvider>
        </SnackbarProvider>
    );
}
