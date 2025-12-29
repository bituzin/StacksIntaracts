;; enhanced-post-message.clar - Clarity 4
;; Extended version with frontend-friendly read functions
;; Compatible with all Clarity environments

(define-constant MAX_LEN u280)
(define-constant BLOCKS_PER_DAY u144)
(define-constant MAX_BATCH_SIZE u20)

(define-data-var total-messages uint u0)
(define-data-var total-messages-today uint u0)
(define-data-var last-message-day uint u0)

(define-map messages uint {
  sender: principal,
  block: uint,
  timestamp: uint,
  content: (string-ascii 280)
})

;; Track messages by author for easier filtering
(define-map user-message-count principal uint)
(define-map user-messages {user: principal, index: uint} uint)

;; Error constants
(define-constant err-invalid-length (err u100))
(define-constant err-invalid-range (err u101))
(define-constant err-batch-too-large (err u102))
(define-constant err-message-not-found (err u103))

;; Helper: get current day number
(define-read-only (current-day)
  (ok (/ burn-block-height BLOCKS_PER_DAY))
)

;; Public: send a message
(define-public (post-message (msg (string-ascii 280)))
  (let
    (
      (msg-length (len msg))
      (curr-day (/ burn-block-height BLOCKS_PER_DAY))
      (last-day (var-get last-message-day))
      (msg-id (+ (var-get total-messages) u1))
      (user-msg-count (default-to u0 (map-get? user-message-count tx-sender)))
      ;; Clarity 4: Use real timestamp
      (current-timestamp stacks-block-time)
    )
    ;; Validate message length
    (asserts! (and (> msg-length u0) (<= msg-length MAX_LEN)) err-invalid-length)
    
    ;; Update daily counter
    (if (is-eq curr-day last-day)
      (var-set total-messages-today (+ (var-get total-messages-today) u1))
      (begin
        (var-set total-messages-today u1)
        (var-set last-message-day curr-day)
      )
    )
    
    ;; Save message with timestamp
    (map-set messages msg-id {
      sender: tx-sender,
      block: burn-block-height,
      timestamp: current-timestamp,
      content: msg
    })
    
    ;; Track user's messages
    (map-set user-messages {user: tx-sender, index: user-msg-count} msg-id)
    (map-set user-message-count tx-sender (+ user-msg-count u1))
    
    (var-set total-messages msg-id)
    (ok msg-id)
  )
)

;; Read-only: get message by ID
(define-read-only (get-message (id uint))
  (ok (map-get? messages id))
)

;; Read-only: get messages in range (batch)
(define-read-only (get-messages-range (start-id uint) (end-id uint))
  (let
    (
      (total (var-get total-messages))
    )
    (asserts! (<= start-id end-id) err-invalid-range)
    (asserts! (<= (- end-id start-id) MAX_BATCH_SIZE) err-batch-too-large)
    (asserts! (<= end-id total) err-invalid-range)
    
    (ok {
      start: start-id,
      end: end-id,
      total: total,
      messages: (list
        (map-get? messages start-id)
        (map-get? messages (+ start-id u1))
        (map-get? messages (+ start-id u2))
        (map-get? messages (+ start-id u3))
        (map-get? messages (+ start-id u4))
        (map-get? messages (+ start-id u5))
        (map-get? messages (+ start-id u6))
        (map-get? messages (+ start-id u7))
        (map-get? messages (+ start-id u8))
        (map-get? messages (+ start-id u9))
        (map-get? messages (+ start-id u10))
        (map-get? messages (+ start-id u11))
        (map-get? messages (+ start-id u12))
        (map-get? messages (+ start-id u13))
        (map-get? messages (+ start-id u14))
        (map-get? messages (+ start-id u15))
        (map-get? messages (+ start-id u16))
        (map-get? messages (+ start-id u17))
        (map-get? messages (+ start-id u18))
        (map-get? messages (+ start-id u19))
      )
    })
  )
)

;; Read-only: get latest N messages
(define-read-only (get-latest-messages (count uint))
  (let
    (
      (total (var-get total-messages))
      (start-id (if (> total count) (+ (- total count) u1) u1))
      (end-id total)
    )
    (asserts! (<= count MAX_BATCH_SIZE) err-batch-too-large)
    (asserts! (> total u0) err-message-not-found)
    (get-messages-range start-id end-id)
  )
)

;; Read-only: get user's message count
(define-read-only (get-user-message-count (user principal))
  (ok (default-to u0 (map-get? user-message-count user)))
)

;; Read-only: get user's message ID by index
(define-read-only (get-user-message-id (user principal) (index uint))
  (ok (map-get? user-messages {user: user, index: index}))
)

;; Read-only: get user's latest messages
(define-read-only (get-user-latest-messages (user principal) (count uint))
  (let
    (
      (user-total (default-to u0 (map-get? user-message-count user)))
      (start-index (if (> user-total count) (- user-total count) u0))
    )
    (asserts! (<= count MAX_BATCH_SIZE) err-batch-too-large)
    (asserts! (> user-total u0) err-message-not-found)
    
    (ok {
      user: user,
      total-count: user-total,
      start-index: start-index,
      count: count,
      messages: (list
        (get-user-msg-at user start-index)
        (get-user-msg-at user (+ start-index u1))
        (get-user-msg-at user (+ start-index u2))
        (get-user-msg-at user (+ start-index u3))
        (get-user-msg-at user (+ start-index u4))
        (get-user-msg-at user (+ start-index u5))
        (get-user-msg-at user (+ start-index u6))
        (get-user-msg-at user (+ start-index u7))
        (get-user-msg-at user (+ start-index u8))
        (get-user-msg-at user (+ start-index u9))
        (get-user-msg-at user (+ start-index u10))
        (get-user-msg-at user (+ start-index u11))
        (get-user-msg-at user (+ start-index u12))
        (get-user-msg-at user (+ start-index u13))
        (get-user-msg-at user (+ start-index u14))
        (get-user-msg-at user (+ start-index u15))
        (get-user-msg-at user (+ start-index u16))
        (get-user-msg-at user (+ start-index u17))
        (get-user-msg-at user (+ start-index u18))
        (get-user-msg-at user (+ start-index u19))
      )
    })
  )
)

;; Private: get user message at index
(define-private (get-user-msg-at (user principal) (index uint))
  (match (map-get? user-messages {user: user, index: index})
    msg-id (map-get? messages msg-id)
    none
  )
)

;; Read-only: get total messages
(define-read-only (get-total-messages)
  (ok (var-get total-messages))
)

;; Read-only: get today's messages count
(define-read-only (get-today-messages)
  (ok (var-get total-messages-today))
)

;; Read-only: get contract stats (all info in one call)
(define-read-only (get-stats)
  (ok {
    total-messages: (var-get total-messages),
    today-messages: (var-get total-messages-today),
    current-day: (/ burn-block-height BLOCKS_PER_DAY),
    current-block: burn-block-height,
    last-message-day: (var-get last-message-day)
  })
)

;; Read-only: check if message exists
(define-read-only (message-exists (id uint))
  (ok (is-some (map-get? messages id)))
)

;; Read-only: get message with metadata
(define-read-only (get-message-with-meta (id uint))
  (match (map-get? messages id)
    message (ok (some {
      id: id,
      sender: (get sender message),
      content: (get content message),
      block: (get block message),
      timestamp: (get timestamp message),
      blocks-ago: (- burn-block-height (get block message)),
      message-number: id,
      total-messages: (var-get total-messages)
    }))
    (ok none)
  )
)

;; Read-only: get paginated feed (page number based)
(define-read-only (get-messages-page (page uint) (per-page uint))
  (let
    (
      (total (var-get total-messages))
      (start-id (if (> page u0) (+ (* (- page u1) per-page) u1) u1))
      (end-id (+ start-id per-page))
      (actual-end (if (> end-id total) total end-id))
    )
    (asserts! (> page u0) err-invalid-range)
    (asserts! (<= per-page MAX_BATCH_SIZE) err-batch-too-large)
    (asserts! (> total u0) err-message-not-found)
    
    (get-messages-range start-id actual-end)
  )
)

;; Read-only: get message count by user
(define-read-only (get-user-stats (user principal))
  (let
    (
      (msg-count (default-to u0 (map-get? user-message-count user)))
    )
    (ok {
      user: user,
      message-count: msg-count,
      has-messages: (> msg-count u0)
    })
  )
)