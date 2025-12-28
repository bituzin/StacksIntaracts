;; Username Registry Smart Contract - Simplified
;; Simple username registration system on Stacks

;; Constants
(define-constant ERR_USERNAME_TAKEN (err u101))
(define-constant ERR_USERNAME_TOO_SHORT (err u102))
(define-constant ERR_USERNAME_TOO_LONG (err u103))
(define-constant ERR_ALREADY_HAS_USERNAME (err u109))
(define-constant ERR_NOT_OWNER (err u107))
(define-constant ERR_USERNAME_NOT_FOUND (err u106))

(define-constant MIN_USERNAME_LENGTH u3)
(define-constant MAX_USERNAME_LENGTH u30)

;; Data Variables
(define-data-var total-usernames uint u0)

;; Data Maps
(define-map usernames
    { username: (string-ascii 30) }
    { 
        owner: principal,
        registered-at: uint
    }
)

(define-map address-to-username
    { owner: principal }
    { username: (string-ascii 30) }
)

;; Read-Only Functions
(define-read-only (get-total-usernames)
    (var-get total-usernames)
)

(define-read-only (get-username-owner (username (string-ascii 30)))
    (match (map-get? usernames { username: username })
        entry (some (get owner entry))
        none
    )
)

(define-read-only (get-address-username (owner principal))
    (match (map-get? address-to-username { owner: owner })
        entry (some (get username entry))
        none
    )
)

(define-read-only (is-username-available (username (string-ascii 30)))
    (is-none (map-get? usernames { username: username }))
)

(define-read-only (has-username (owner principal))
    (is-some (map-get? address-to-username { owner: owner }))
)

;; Clarity 4: Get username registration timestamp
(define-read-only (get-username-registered-at (username (string-ascii 30)))
    (match (map-get? usernames { username: username })
        entry (some (get registered-at entry))
        none
    )
)

;; Clarity 4: Format principal as ASCII string using to-ascii?
(define-read-only (get-owner-as-string (owner principal))
    (to-ascii? owner)
)

;; Public Functions
(define-public (register-username (username (string-ascii 30)))
    (let
        (
            (caller tx-sender)
            ;; Clarity 4: Get current block timestamp
            (current-time stacks-block-time)
        )
        ;; Check if username is available
        (asserts! (is-username-available username) ERR_USERNAME_TAKEN)
        
        ;; Check if caller already has a username
        (asserts! (not (has-username caller)) ERR_ALREADY_HAS_USERNAME)
        
        ;; Register the username with timestamp (Clarity 4: stacks-block-time)
        (map-set usernames
            { username: username }
            { 
                owner: caller,
                registered-at: current-time
            }
        )
        
        ;; Set reverse lookup
        (map-set address-to-username
            { owner: caller }
            { username: username }
        )
        
        ;; Update stats
        (var-set total-usernames (+ (var-get total-usernames) u1))
        
        (ok username)
    )
)

(define-public (release-username (username (string-ascii 30)))
    (let
        (
            (caller tx-sender)
            (username-entry (unwrap! (map-get? usernames { username: username }) ERR_USERNAME_NOT_FOUND))
        )
        ;; Check caller is the owner
        (asserts! (is-eq caller (get owner username-entry)) ERR_NOT_OWNER)
        
        ;; Delete username
        (map-delete usernames { username: username })
        
        ;; Delete reverse lookup
        (map-delete address-to-username { owner: caller })
        
        ;; Update stats
        (var-set total-usernames (- (var-get total-usernames) u1))
        
        (ok true)
    )
)
