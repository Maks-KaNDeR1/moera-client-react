import { PrincipalValue } from "api/node/api-types";

export interface NodeNameState {
    loaded: boolean;
    loading: boolean;
    name: string | null;
    operationStatus: string | null;
    operationStatusUpdated: number | null;
    operationErrorCode: string | null;
    operationErrorMessage: string | null;
    operations: {
        manage: PrincipalValue;
    };
    showingRegisterDialog: boolean;
    registering: boolean;
    mnemonicName: string | null;
    mnemonic: string[] | null;
    showingUpdateDialog: boolean;
    showingChangeName: boolean;
    updating: boolean;
}
