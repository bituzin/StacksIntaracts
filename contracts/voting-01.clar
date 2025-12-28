
(define-constant MAX_OPTIONS u10)
(define-constant MAX_TITLE_LENGTH u100)
(define-constant MAX_DESCRIPTION_LENGTH u500)
(define-constant MAX_OPTION_LENGTH u100)
(define-constant MIN_DURATION u10) ;; minimum blocks

;; Status constants
(define-constant STATUS_ACTIVE u1)
(define-constant STATUS_CLOSED u2)
(define-constant STATUS_CANCELLED u3)

;; Error codes
(define-constant err-not-authorized (err u401))
(define-constant err-poll-not-found (err u404))
(define-constant err-poll-closed (err u405))
(define-constant err-poll-active (err u406))
(define-constant err-invalid-option (err u407))
(define-constant err-vote-limit-reached (err u408))
(define-constant err-stx-requirement-not-met (err u409))
(define-constant err-too-many-options (err u410))
(define-constant err-invalid-title (err u411))
(define-constant err-invalid-duration (err u412))
(define-constant err-no-options (err u413))
(define-constant err-invalid-votes-per-user (err u414))

;; ===========================================
;; DATA VARIABLES
;; ===========================================

(define-data-var poll-counter uint u0)
(define-data-var total-active-polls uint u0)
(define-data-var total-closed-polls uint u0)
(define-data-var total-cancelled-polls uint u0)

;; ===========================================
;; DATA MAPS
;; ===========================================

;; Main poll data
(define-map polls uint {
  creator: principal,
  title: (string-utf8 100),
  description: (string-utf8 500),
  options-count: uint,
  created-at: uint,
  created-at-timestamp: uint,
  ends-at: uint,
  status: uint,
  votes-per-user: uint,
  requires-stx: bool,
  min-stx-amount: uint,
  total-votes: uint,
  total-voters: uint,
  last-update-timestamp: uint
})

;; Poll options
(define-map poll-options {poll-id: uint, option-index: uint} {
  text: (string-utf8 100),
  votes: uint
})

;; User votes on specific poll
(define-map user-votes {poll-id: uint, voter: principal} {
  vote-count: uint,
  voted-options: (list 10 uint),
  last-vote-block: uint,
  last-vote-timestamp: uint
})

;; User statistics
(define-map user-stats principal {
  polls-created: uint,
  polls-voted: uint,
  total-votes-cast: uint,
  last-activity-block: uint,
  last-activity-timestamp: uint
})

;; Track if user participated in poll
(define-map user-poll-participation {user: principal, poll-id: uint} bool)

;; Creator's polls list
(define-map creator-polls {creator: principal, index: uint} uint)
(define-map creator-poll-count principal uint)

;; Track polls user voted in
(define-map user-voted-polls {user: principal, index: uint} uint)
(define-map user-voted-count principal uint)

;; ===========================================
;; PRIVATE FUNCTIONS
;; ===========================================

(define-private (increment-poll-counter)
  (let ((current (var-get poll-counter)))
    (var-set poll-counter (+ current u1))
    (+ current u1)
  )
)

(define-private (update-creator-stats (creator principal))
  (let
    (
      (current-stats (default-to 
        {polls-created: u0, polls-voted: u0, total-votes-cast: u0, last-activity-block: u0, last-activity-timestamp: u0}
        (map-get? user-stats creator)
      ))
      (current-timestamp stacks-block-time)
    )
    (map-set user-stats creator 
      (merge current-stats {
        polls-created: (+ (get polls-created current-stats) u1),
        last-activity-block: burn-block-height,
        last-activity-timestamp: current-timestamp
      })
    )
  )
)

(define-private (update-voter-stats (voter principal))
  (let
    (
      (current-stats (default-to 
        {polls-created: u0, polls-voted: u0, total-votes-cast: u0, last-activity-block: u0, last-activity-timestamp: u0}
        (map-get? user-stats voter)
      ))
      (current-timestamp stacks-block-time)
    )
    (map-set user-stats voter 
      (merge current-stats {
        polls-voted: (+ (get polls-voted current-stats) u1),
        total-votes-cast: (+ (get total-votes-cast current-stats) u1),
        last-activity-block: burn-block-height,
        last-activity-timestamp: current-timestamp
      })
    )
  )
)

(define-private (add-creator-poll (creator principal) (poll-id uint))
  (let
    (
      (count (default-to u0 (map-get? creator-poll-count creator)))
    )
    (map-set creator-polls {creator: creator, index: count} poll-id)
    (map-set creator-poll-count creator (+ count u1))
  )
)

(define-private (add-user-voted-poll (user principal) (poll-id uint))
  (let
    (
      (count (default-to u0 (map-get? user-voted-count user)))
    )
    (map-set user-voted-polls {user: user, index: count} poll-id)
    (map-set user-voted-count user (+ count u1))
  )
)

(define-private (is-poll-active (poll {creator: principal, title: (string-utf8 100), description: (string-utf8 500), options-count: uint, created-at: uint, created-at-timestamp: uint, ends-at: uint, status: uint, votes-per-user: uint, requires-stx: bool, min-stx-amount: uint, total-votes: uint, total-voters: uint, last-update-timestamp: uint}))
  (and 
    (is-eq (get status poll) STATUS_ACTIVE)
    (<= burn-block-height (get ends-at poll))
  )
)

;; ===========================================
;; PUBLIC FUNCTIONS
;; ===========================================

(define-public (create-poll 
  (title (string-utf8 100))
  (description (string-utf8 500))
  (option-0 (string-utf8 100))
  (option-1 (optional (string-utf8 100)))
  (option-2 (optional (string-utf8 100)))
  (option-3 (optional (string-utf8 100)))
  (option-4 (optional (string-utf8 100)))
  (option-5 (optional (string-utf8 100)))
  (option-6 (optional (string-utf8 100)))
  (option-7 (optional (string-utf8 100)))
  (option-8 (optional (string-utf8 100)))
  (option-9 (optional (string-utf8 100)))
  (duration-blocks uint)
  (votes-per-user uint)
  (requires-stx bool)
  (min-stx-amount uint)
)
  (let
    (
      (poll-id (increment-poll-counter))
      (ends-at (+ burn-block-height duration-blocks))
      (current-timestamp stacks-block-time)
    )
    ;; Validations
    (asserts! (and (> (len title) u0) (<= (len title) MAX_TITLE_LENGTH)) err-invalid-title)
    (asserts! (> (len option-0) u0) err-no-options)
    (asserts! (>= duration-blocks MIN_DURATION) err-invalid-duration)
    (asserts! (> votes-per-user u0) err-invalid-votes-per-user)
    
    ;; Create poll
    (map-set polls poll-id {
      creator: tx-sender,
      title: title,
      description: description,
      options-count: u0,
      created-at: burn-block-height,
      created-at-timestamp: current-timestamp,
      ends-at: ends-at,
      status: STATUS_ACTIVE,
      votes-per-user: votes-per-user,
      requires-stx: requires-stx,
      min-stx-amount: min-stx-amount,
      total-votes: u0,
      total-voters: u0,
      last-update-timestamp: current-timestamp
    })
    
    ;; Store option 0 (required)
    (map-set poll-options {poll-id: poll-id, option-index: u0} {
      text: option-0,
      votes: u0
    })
    
    ;; Store optional options
    (let ((options-count (+ u1
      (if (is-some option-1) (begin (map-set poll-options {poll-id: poll-id, option-index: u1} {text: (unwrap-panic option-1), votes: u0}) u1) u0)
      (if (is-some option-2) (begin (map-set poll-options {poll-id: poll-id, option-index: u2} {text: (unwrap-panic option-2), votes: u0}) u1) u0)
      (if (is-some option-3) (begin (map-set poll-options {poll-id: poll-id, option-index: u3} {text: (unwrap-panic option-3), votes: u0}) u1) u0)
      (if (is-some option-4) (begin (map-set poll-options {poll-id: poll-id, option-index: u4} {text: (unwrap-panic option-4), votes: u0}) u1) u0)
      (if (is-some option-5) (begin (map-set poll-options {poll-id: poll-id, option-index: u5} {text: (unwrap-panic option-5), votes: u0}) u1) u0)
      (if (is-some option-6) (begin (map-set poll-options {poll-id: poll-id, option-index: u6} {text: (unwrap-panic option-6), votes: u0}) u1) u0)
      (if (is-some option-7) (begin (map-set poll-options {poll-id: poll-id, option-index: u7} {text: (unwrap-panic option-7), votes: u0}) u1) u0)
      (if (is-some option-8) (begin (map-set poll-options {poll-id: poll-id, option-index: u8} {text: (unwrap-panic option-8), votes: u0}) u1) u0)
      (if (is-some option-9) (begin (map-set poll-options {poll-id: poll-id, option-index: u9} {text: (unwrap-panic option-9), votes: u0}) u1) u0)
    )))
      
      ;; Update options count
      (map-set polls poll-id 
        (merge (unwrap-panic (map-get? polls poll-id)) {options-count: options-count, last-update-timestamp: current-timestamp})
      )
      
      ;; Update stats
      (update-creator-stats tx-sender)
      (add-creator-poll tx-sender poll-id)
      (var-set total-active-polls (+ (var-get total-active-polls) u1))
      
      (ok poll-id)
    )
  )
)

(define-public (vote (poll-id uint) (option-index uint))
  (let
    (
      (poll (unwrap! (map-get? polls poll-id) err-poll-not-found))
      (user-vote-data (default-to 
        {vote-count: u0, voted-options: (list), last-vote-block: u0, last-vote-timestamp: u0}
        (map-get? user-votes {poll-id: poll-id, voter: tx-sender})
      ))
      (current-vote-count (get vote-count user-vote-data))
      (voted-options (get voted-options user-vote-data))
      (option (unwrap! (map-get? poll-options {poll-id: poll-id, option-index: option-index}) err-invalid-option))
      (user-stx-balance (stx-get-balance tx-sender))
      (is-first-vote (is-none (map-get? user-poll-participation {user: tx-sender, poll-id: poll-id})))
      (current-timestamp stacks-block-time)
    )
    ;; Validations
    (asserts! (is-poll-active poll) err-poll-closed)
    (asserts! (< option-index (get options-count poll)) err-invalid-option)
    (asserts! (< current-vote-count (get votes-per-user poll)) err-vote-limit-reached)
    
    ;; Check STX requirement
    (if (get requires-stx poll)
      (asserts! (>= user-stx-balance (get min-stx-amount poll)) err-stx-requirement-not-met)
      true
    )
    
    ;; Update option votes
    (map-set poll-options {poll-id: poll-id, option-index: option-index} 
      (merge option {votes: (+ (get votes option) u1)})
    )
    
    ;; Update user votes
    (map-set user-votes {poll-id: poll-id, voter: tx-sender} {
      vote-count: (+ current-vote-count u1),
      voted-options: (unwrap-panic (as-max-len? (append voted-options option-index) u10)),
      last-vote-block: burn-block-height,
      last-vote-timestamp: current-timestamp
    })
    
    ;; Track participation and update stats
    (if is-first-vote
      (begin
        (map-set user-poll-participation {user: tx-sender, poll-id: poll-id} true)
        (map-set polls poll-id 
          (merge poll {
            total-votes: (+ (get total-votes poll) u1),
            total-voters: (+ (get total-voters poll) u1),
            last-update-timestamp: current-timestamp
          })
        )
        (update-voter-stats tx-sender)
        (add-user-voted-poll tx-sender poll-id)
      )
      (map-set polls poll-id 
        (merge poll {total-votes: (+ (get total-votes poll) u1), last-update-timestamp: current-timestamp})
      )
    )
    
    (ok true)
  )
)

(define-public (change-vote (poll-id uint) (old-option-index uint) (new-option-index uint))
  (let
    (
      (poll (unwrap! (map-get? polls poll-id) err-poll-not-found))
      (user-vote-data (unwrap! (map-get? user-votes {poll-id: poll-id, voter: tx-sender}) err-poll-not-found))
      (old-option (unwrap! (map-get? poll-options {poll-id: poll-id, option-index: old-option-index}) err-invalid-option))
      (new-option (unwrap! (map-get? poll-options {poll-id: poll-id, option-index: new-option-index}) err-invalid-option))
      (current-timestamp stacks-block-time)
    )
    ;; Validations
    (asserts! (is-poll-active poll) err-poll-closed)
    (asserts! (< new-option-index (get options-count poll)) err-invalid-option)
    
    ;; Update old option (decrease)
    (map-set poll-options {poll-id: poll-id, option-index: old-option-index} 
      (merge old-option {votes: (- (get votes old-option) u1)})
    )
    
    ;; Update new option (increase)
    (map-set poll-options {poll-id: poll-id, option-index: new-option-index} 
      (merge new-option {votes: (+ (get votes new-option) u1)})
    )
    
    ;; Update timestamp
    (map-set user-votes {poll-id: poll-id, voter: tx-sender}
      (merge user-vote-data {last-vote-block: burn-block-height, last-vote-timestamp: current-timestamp})
    )
    (map-set polls poll-id
      (merge poll {last-update-timestamp: current-timestamp})
    )
    
    (ok true)
  )
)

(define-public (cancel-poll (poll-id uint))
  (let
    (
      (poll (unwrap! (map-get? polls poll-id) err-poll-not-found))
      (current-timestamp stacks-block-time)
    )
    (asserts! (is-eq tx-sender (get creator poll)) err-not-authorized)
    (asserts! (is-eq (get status poll) STATUS_ACTIVE) err-poll-closed)
    
    (map-set polls poll-id (merge poll {status: STATUS_CANCELLED, last-update-timestamp: current-timestamp}))
    (var-set total-active-polls (- (var-get total-active-polls) u1))
    (var-set total-cancelled-polls (+ (var-get total-cancelled-polls) u1))
    
    (ok true)
  )
)

(define-public (close-poll (poll-id uint))
  (let
    (
      (poll (unwrap! (map-get? polls poll-id) err-poll-not-found))
      (current-timestamp stacks-block-time)
    )
    (asserts! (> burn-block-height (get ends-at poll)) err-poll-active)
    (asserts! (is-eq (get status poll) STATUS_ACTIVE) err-poll-closed)
    
    (map-set polls poll-id (merge poll {status: STATUS_CLOSED, last-update-timestamp: current-timestamp}))
    (var-set total-active-polls (- (var-get total-active-polls) u1))
    (var-set total-closed-polls (+ (var-get total-closed-polls) u1))
    
    (ok true)
  )
)

;; ===========================================
;; READ-ONLY FUNCTIONS
;; ===========================================

(define-read-only (get-poll (poll-id uint))
  (ok (map-get? polls poll-id))
)

(define-read-only (get-poll-status-as-string (poll-id uint))
  (let
    (
      (poll (unwrap! (map-get? polls poll-id) err-poll-not-found))
    )
    (to-ascii? (get status poll))
  )
)

(define-read-only (get-poll-option (poll-id uint) (option-index uint))
  (ok (map-get? poll-options {poll-id: poll-id, option-index: option-index}))
)

(define-read-only (get-all-poll-options (poll-id uint))
  (let
    (
      (poll (unwrap! (map-get? polls poll-id) err-poll-not-found))
    )
    (ok {
      poll-id: poll-id,
      options-count: (get options-count poll),
      option-0: (map-get? poll-options {poll-id: poll-id, option-index: u0}),
      option-1: (map-get? poll-options {poll-id: poll-id, option-index: u1}),
      option-2: (map-get? poll-options {poll-id: poll-id, option-index: u2}),
      option-3: (map-get? poll-options {poll-id: poll-id, option-index: u3}),
      option-4: (map-get? poll-options {poll-id: poll-id, option-index: u4}),
      option-5: (map-get? poll-options {poll-id: poll-id, option-index: u5}),
      option-6: (map-get? poll-options {poll-id: poll-id, option-index: u6}),
      option-7: (map-get? poll-options {poll-id: poll-id, option-index: u7}),
      option-8: (map-get? poll-options {poll-id: poll-id, option-index: u8}),
      option-9: (map-get? poll-options {poll-id: poll-id, option-index: u9})
    })
  )
)

(define-read-only (get-user-votes (poll-id uint) (voter principal))
  (ok (map-get? user-votes {poll-id: poll-id, voter: voter}))
)

(define-read-only (get-user-stats (user principal))
  (ok (default-to 
    {polls-created: u0, polls-voted: u0, total-votes-cast: u0, last-activity-block: u0, last-activity-timestamp: u0}
    (map-get? user-stats user)
  ))
)

(define-read-only (get-global-stats)
  (ok {
    total-polls: (var-get poll-counter),
    active-polls: (var-get total-active-polls),
    closed-polls: (var-get total-closed-polls),
    cancelled-polls: (var-get total-cancelled-polls),
    current-block: burn-block-height,
    current-timestamp: stacks-block-time
  })
)

(define-read-only (get-poll-full-details (poll-id uint))
  (let
    (
      (poll (unwrap! (map-get? polls poll-id) err-poll-not-found))
      (options (unwrap-panic (get-all-poll-options poll-id)))
    )
    (ok {
      poll-id: poll-id,
      creator: (get creator poll),
      title: (get title poll),
      description: (get description poll),
      options-count: (get options-count poll),
      created-at: (get created-at poll),
      created-at-timestamp: (get created-at-timestamp poll),
      ends-at: (get ends-at poll),
      status: (get status poll),
      votes-per-user: (get votes-per-user poll),
      requires-stx: (get requires-stx poll),
      min-stx-amount: (get min-stx-amount poll),
      total-votes: (get total-votes poll),
      total-voters: (get total-voters poll),
      options: options,
      is-active: (is-poll-active poll),
      last-update-timestamp: (get last-update-timestamp poll),
      blocks-remaining: (if (> (get ends-at poll) burn-block-height)
        (- (get ends-at poll) burn-block-height)
        u0
      )
    })
  )
)

(define-read-only (has-user-voted (poll-id uint) (user principal))
  (ok (is-some (map-get? user-poll-participation {user: user, poll-id: poll-id})))
)

(define-read-only (get-creator-poll-count (creator principal))
  (ok (default-to u0 (map-get? creator-poll-count creator)))
)

(define-read-only (get-creator-poll-at-index (creator principal) (index uint))
  (ok (map-get? creator-polls {creator: creator, index: index}))
)

(define-read-only (get-user-voted-poll-count (user principal))
  (ok (default-to u0 (map-get? user-voted-count user)))
)

(define-read-only (get-user-voted-poll-at-index (user principal) (index uint))
  (ok (map-get? user-voted-polls {user: user, index: index}))
)

(define-read-only (get-poll-results (poll-id uint))
  (let
    (
      (poll (unwrap! (map-get? polls poll-id) err-poll-not-found))
      (options (unwrap-panic (get-all-poll-options poll-id)))
    )
    (ok {
      poll-id: poll-id,
      title: (get title poll),
      status: (get status poll),
      total-votes: (get total-votes poll),
      total-voters: (get total-voters poll),
      options: options,
      created-at-timestamp: (get created-at-timestamp poll),
      last-update-timestamp: (get last-update-timestamp poll),
      is-ended: (> burn-block-height (get ends-at poll)),
      winner: none
    })
  )
)

(define-read-only (can-user-vote (poll-id uint) (user principal))
  (let
    (
      (poll (unwrap! (map-get? polls poll-id) err-poll-not-found))
      (user-vote-data (default-to 
        {vote-count: u0, voted-options: (list), last-vote-block: u0, last-vote-timestamp: u0}
        (map-get? user-votes {poll-id: poll-id, voter: user})
      ))
      (user-stx-balance (stx-get-balance user))
    )
    (ok {
      can-vote: (and
        (is-poll-active poll)
        (< (get vote-count user-vote-data) (get votes-per-user poll))
        (or 
          (not (get requires-stx poll))
          (>= user-stx-balance (get min-stx-amount poll))
        )
      ),
      reason: (if (not (is-poll-active poll))
        "Poll is not active"
        (if (>= (get vote-count user-vote-data) (get votes-per-user poll))
          "Vote limit reached"
          (if (and (get requires-stx poll) (< user-stx-balance (get min-stx-amount poll)))
            "Insufficient STX balance"
            "Can vote"
          )
        )
      )
    })
  )
)