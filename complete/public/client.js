/*
 * @license
 * Copyright 2023 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
export const $ = document.querySelector.bind(document);

export async function _fetch(path, payload = '') {
  const headers = {
    'X-Requested-With': 'XMLHttpRequest',
  };
  if (payload && !(payload instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(payload);
  }
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    headers: headers,
    body: payload,
  });
  if (res.status === 200) {
    // Server authentication succeeded
    return res.json();
  } else {
    // Server authentication failed
    const result = await res.json();
    throw new Error(result.error);
  }
};

class Loading {
  constructor() {
    this.progress = $('#progress');
  }
  start() {
    this.progress.classList.remove("hidden");
    const inputs = document.querySelectorAll('input');
    if (inputs) {
      inputs.forEach(input => input.disabled = true);
    }
  }
  stop() {
    this.progress.classList.add("hidden");
    const inputs = document.querySelectorAll('input');
    if (inputs) {
      inputs.forEach(input => input.disabled = false);
    }
  }
}

export const loading = new Loading();

// TODO: Add an ability to create a passkey: Create the registerCredential() function.

export async function registerCredential() {

  // TODO: Add an ability to create a passkey: Obtain the challenge and other options from the server endpoint.

  const _options = await _fetch('/auth/registerRequest');

  // TODO: Add an ability to create a passkey: Create a credential.

  // Deserialize and decode the `PublicKeyCredential.parseCreationOptionsFromJSON()`.
  const options = PublicKeyCredential.parseCreationOptionsFromJSON(_options);

  // Use platform authenticator and discoverable credential.
  options.authenticatorSelection = {
    authenticatorAttachment: 'platform',
    requireResidentKey: true
  }

  // Invoke the WebAuthn create() method.
  const cred = await navigator.credentials.create({
    publicKey: options,
  });

  // TODO: Add an ability to create a passkey: Register the credential to the server endpoint.

  // Encode and serialize the `PublicKeyCredential`.
  const credential = JSON.stringify(cred);

  return await _fetch('/auth/registerResponse', credential);
};

// TODO: Add an ability to authenticate with a passkey: Create the authenticate() function.

export async function authenticate() {

  // TODO: Add an ability to authenticate with a passkey: Obtain the challenge and other options from the server endpoint.

  const _options = await _fetch('/auth/signinRequest');

  // TODO: Add an ability to authenticate with a passkey: Locally verify the user and get a credential.

  // Base64URL decode the challenge.
  const options = PublicKeyCredential.parseRequestOptionsFromJSON(_options);

  // An empty allowCredentials array invokes an account selector by discoverable credentials.
  options.allowCredentials = [];

  // Invoke the WebAuthn get() method.
  const cred = await navigator.credentials.get({
    publicKey: options,
    // Request a conditional UI
    mediation: 'conditional'
  });

  // TODO: Add an ability to authenticate with a passkey: Verify the credential.

  // Encode and serialize the `PublicKeyCredential`.
  const credential = JSON.stringify(cred);

  return await _fetch(`/auth/signinResponse`, credential);
};

export async function updateCredential(credId, newName) {
  return _fetch(`/auth/renameKey`, { credId, newName });
}

export async function unregisterCredential(credId) {
  return _fetch(`/auth/removeKey?credId=${encodeURIComponent(credId)}`);
};
